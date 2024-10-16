import axios from 'axios'
import JSZip from 'jszip'
import {
    createEmpty as emptyExtent,
    extend as extendExtent,
    isEmpty as isExtentEmpty,
} from 'ol/extent'
import Feature from 'ol/Feature'
import GeoJSON from 'ol/format/GeoJSON'
import IconStyle from 'ol/style/Icon'
import Style from 'ol/style/Style'

import EditableFeature, { EditableFeatureTypes } from '@/api/features/EditableFeature.class'
import { extractOlFeatureCoordinates } from '@/api/features/features.api'
import { proxifyUrl } from '@/api/file-proxy.api'
import { DEFAULT_TITLE_OFFSET, DrawingIcon } from '@/api/icon.api'
import { WGS84 } from '@/utils/coordinates/coordinateSystems'
import {
    allStylingSizes,
    featureStyleFunction,
    getFeatureStyleColor,
    getStyle,
    getTextColor,
    getTextSize,
    RED,
    SMALL,
} from '@/utils/featureStyleUtils'
import { GeodesicGeometries } from '@/utils/geodesicManager'
import log from '@/utils/logging'
// FIXME: as soon as https://github.com/openlayers/openlayers/pull/15964 is merged and released, go back to using OL files
import KML, { getDefaultStyle } from '@/utils/ol/format/KML'
import { parseRGBColor } from '@/utils/utils'

export const EMPTY_KML_DATA = '<kml></kml>'

// On the legacy drawing, openlayer used the scale from xml as is, but since openlayer
// version 6.7, the scale has been normalized to 32 pixels, therefore we need to add the
// 32 pixel scale factor below
// scale_factor := iconStyle.getSize()[0] / 32
// iconStyle.getSize()[0] = 48 (always 48 pixel on old viewer)
// scale_factor = 48/32 => 1.5
// See https://github.com/openlayers/openlayers/pull/12695
export const LEGACY_ICON_XML_SCALE_FACTOR = 1.5

/**
 * Read the KML name
 *
 * @param {string} content Kml content
 * @returns {string} Return KML name
 */
export function parseKmlName(content) {
    const kml = new KML({ extractStyles: false })

    return kml.readName(content)
}

/**
 * Get KML extent
 *
 * @param {string} content KML content
 * @returns {ol/extent|null} KML layer extent in WGS84 projection or null if the KML has no features
 */
export function getKmlExtent(content) {
    const kml = new KML({ extractStyles: false })
    const features = kml.readFeatures(content, {
        dataProjection: WGS84.epsg, // KML files should always be in WGS84
        featureProjection: WGS84.epsg,
    })
    const extent = emptyExtent()
    features
        // guarding against empty/null geometry (in case the KML feature doesn't declare any coordinate)
        .filter((feature) => !!feature.getGeometry()?.getExtent())
        .forEach((feature) => {
            extendExtent(extent, feature.getGeometry().getExtent())
        })
    if (isExtentEmpty(extent)) {
        return null
    }
    return extent
}

/**
 * Get the KML feature type
 *
 * The type is taken from the geoadmin proprietary "type" property, and if this property is not
 * available it means that it is not a Geoadmin drawing and is therefore returning null.
 *
 * @param {ol/Feature} kmlFeature Open layer kml feature
 * @returns {String | null} KML feature type or null if this is not a geoadmin kml feature
 */
export function getFeatureType(kmlFeature) {
    let featureType = kmlFeature.get('type')?.toUpperCase() // only set by geoadmin's kml
    if (!featureType) {
        // Very old geoadmin KML don't have the type property but the type can be taken from the
        // id
        log.debug(
            `Missing feature type property trying to guess it from the feature ID: ${kmlFeature.getId()}`
        )
        featureType = /(?<type>\w+)_\d+/.exec(kmlFeature.getId())?.groups?.type?.toUpperCase()
    }

    if (!Object.values(EditableFeatureTypes).includes(featureType)) {
        log.info(
            `Type ${featureType} of feature in kml not recognized, not a geoadmin feature ignoring it`,
            kmlFeature
        )
        return null
    }
    return featureType
}

/**
 * Get feature text scale from style
 *
 * @param {Style} style
 * @returns {number | null} Return text scale or null if not found
 */
export function getTextScale(style) {
    // When exporting the kml, the parser does not put a scale property when the scale is 1.
    // But when importing the kml, it seems that the parser interprets the lack of a scale
    // property as if the scale was 0.8, which is strange. The code below tries to fix that.
    let textScale = style.getText()?.getScale() ?? null
    if (textScale === getDefaultStyle()?.getText()?.getScale()) {
        return 1
    }
    return textScale
}

/**
 * Get KML icon style
 *
 * @param {Style} style
 * @returns {IconStyle | null} Returns the KML icon style if present otherwise null
 */
export function getIconStyle(style) {
    if (!(style instanceof Style)) {
        return null
    }
    let icon = style.getImage()
    if (!(icon instanceof IconStyle)) {
        return null
    }
    // To interpret the KMLs the same way as GoogleEarth, the kml parser automatically adds a Google icon
    // if no icon is present (i.e. for our text feature type), but we do not want that.
    if (
        icon?.getSrc()?.match(/google/) ||
        icon?.getSrc() === getDefaultStyle()?.getImage()?.getSrc()
    ) {
        return null
    }
    return icon
}

class IconColorArg {
    /**
     * @param {Number} r
     * @param {Number} g
     * @param {Number} b
     */
    constructor(r, g, b) {
        this.r = r
        this.g = g
        this.b = b
    }
}

class IconArgs {
    /**
     * @param {string} set
     * @param {string} name
     * @param {IconColorArg} color
     * @param {Boolean} isLegacy
     */
    constructor(set, name, color, isLegacy) {
        this.set = set
        this.name = name
        this.color = color
        this.isLegacy = isLegacy
    }
}

/**
 * Parse an Icon URL
 *
 * This handle also the legacy icon url of the following styles:
 *
 * - /color/{r},{g},{b}/{image}-{size}@{scale}x.png
 * - /{version}/img/maki/{image}-{size}@{scale}x.png
 * - /images/{set_name}/{image}
 *
 * As well as the new style:
 *
 * - /api/icons/sets/{set_name}/icons/{icon_name}@{icon_scale}-{red},{green},{blue}.png
 *
 * @param {string} url URL string
 * @returns {IconArgs | null} Returns the parsed URL or null in case of invalid non recognize url
 */
export function parseIconUrl(url) {
    // legacy icon urls pattern
    // default set := /color/{r},{g},{b}/{image}-{size}@{scale}x.png
    // default set legacy versioned url := /{version}/img/maki/{image}-{size}@{scale}x.png
    const legacyDefaultMatch =
        /color\/(?<r>\d+),(?<g>\d+),(?<b>\d+)\/(?<name>[^/]+)-(?<size>\d+)@(?<scale>\d+)x\.png$/.exec(
            url
        )
    const legacyUrlDefaultMatch =
        /\d+\/img\/maki\/(?<name>[^/]+)-(?<size>\d+)@(?<scale>\d+)x\.png$/.exec(url)

    // babs set := /images/{set_name}/{image}
    const legacySetMatch = /images\/(?<set>\w+)\/(?<name>[^/]+)\.png$/.exec(url)

    // new icon urls pattern
    // /api/icons/sets/{set_name}/icons/{icon_name}.png
    // /api/icons/sets/{set_name}/icons/{icon_name}@{icon_scale}-{red},{green},{blue}.png
    // if cannot be parsed from legacy or new pattern, then use default
    const setMatch =
        /api\/icons\/sets\/(?<set>[\w-]+)\/icons\/(?<name>.+?)(@(?<scale>\d+(\.\d+)?)x-(?<r>\d+),(?<g>\d+),(?<b>\d+))\.png/.exec(
            url
        )

    const match = legacyDefaultMatch ?? legacyUrlDefaultMatch ?? legacySetMatch ?? setMatch

    if (!match) {
        log.warn(`Could not retrieve icon infos from URL ${url}`)
        return null
    }

    const setName = match.groups.set ?? 'default'
    const name = match.groups.name ?? 'unknown'
    const isLegacy = !!(legacyDefaultMatch || legacyUrlDefaultMatch || legacySetMatch)

    return new IconArgs(
        setName,
        name,
        new IconColorArg(
            parseRGBColor(match.groups.r ?? 255, 'R'),
            parseRGBColor(match.groups.g ?? 0, 'B'),
            parseRGBColor(match.groups.b ?? 0, 'G')
        ),
        isLegacy
    )
}

/**
 * Generates an icon that has the url of the given olIcon
 *
 * This is used for non geoadmin KMLs
 *
 * @param {IconStyle} iconStyle
 * @param {IconArgs} iconArgs
 * @returns {DrawingIcon}
 */
function generateIconFromStyle(iconStyle, iconArgs) {
    if (!iconStyle || !iconArgs) {
        return null
    }
    iconStyle.setDisplacement([0, 0])
    const url = iconStyle.getSrc()
    const size = iconStyle.getSize()
    let anchor = iconStyle.getAnchor()
    try {
        anchor[0] /= size[0]
        anchor[1] /= size[1]
    } catch (error) {
        log.error(`Failed to compute icon anchor: anchor=${anchor}, size=${size}`)
        anchor = [0, 0]
    }

    return url && anchor ? new DrawingIcon(iconArgs.name, url, url, iconArgs.set, anchor) : null
}

/**
 * Get KML drawing icon from style
 *
 * This returns null if the icon is not a geoadmin icon, but returns a default icon if the icon
 * cannot be found in the icon list.
 *
 * @param {IconArgs} iconArgs Geoadmin icon arguments
 * @param {IconStyle | null} iconStyle Ol icon style
 * @param {DrawingIconSet[] | null} availableIconSets
 * @returns {DrawingIcon | null} Return the drawing icon or null in case of non geoadmin icon
 */
export function getIcon(iconArgs, iconStyle, availableIconSets, iconNotFoundCallback = null) {
    console.log('getIcon', iconArgs, iconStyle, availableIconSets, iconNotFoundCallback)
    if (!iconArgs) {
        return null
    }

    // Here if we have already the icon sets and can find the icon within the available sets
    // we are using it, if not we generate the DrawingIcon from the URL parsing.
    // Creating the DrawingIcon from the URL parsing works well for almost all uses cases, the
    // exception is for legacy default set url where the name doesn't have the numbered prefix.
    // That means that in this case if we don't have the icon sets when parsing and we then open
    // the drawing menu, when clicking on an icon the preselection in the icon dropdown will not
    // work ! This in theory only happens when opening a legacy drawing with the admin id.
    // See also the watcher in DrawingModule trying to solve this.
    if (!availableIconSets) {
        log.error(`Iconset not yet available fallback to default icon`)
        return generateIconFromStyle(iconStyle, iconArgs)
    }
    const iconSet = availableIconSets.find((drawingIconSet) => drawingIconSet.name === iconArgs.set)
    if (!iconSet) {
        if (iconNotFoundCallback) {
            iconNotFoundCallback()
        } else {
            log.error(`Iconset ${iconArgs.set} not found, fallback to default icon`)
        }
        return generateIconFromStyle(iconStyle, iconArgs)
    }

    // The icon name on the legacy default set was without numbered prefix, therefore add a
    // regex numbered prefix to it. This allow for the new icon url syntax to do a full match
    // while on legacy default url we use only the name without numbered prefix
    const namePrefix = iconArgs.isLegacy ? '(\\d+-)?' : ''
    const nameRegex = new RegExp(`^${namePrefix}${iconArgs.name}$`)

    const icon = iconSet.icons.find((drawingIcon) => nameRegex.test(drawingIcon.name))
    if (!icon) {
        log.error(
            `Can not find icon ${iconArgs.name} in set ${iconArgs.set}, fallback to default icon`
        )
        return generateIconFromStyle(iconStyle, iconArgs)
    }
    return icon
}

/**
 * Get icon Size
 *
 * Default to SMALL if not found in style
 *
 * @param {IconStyle} iconStyle
 * @returns {FeatureStyleSize} Returns the icon size
 */
function getIconSize(iconStyle) {
    const iconScale = iconStyle.getScale()
    if (iconScale) {
        return allStylingSizes.find((size) => size.iconScale === iconScale) ?? SMALL
    }
    return SMALL
}

/**
 * Get the fill color from icon arguments or style
 *
 * @param {Style} style
 * @param {ol/geom/Type} geometryType
 * @param {IconArg} iconArgs
 * @returns {FeatureStyleColor} Returns fill color (default RED if not found in style)
 */
export function getFillColor(style, geometryType, iconArgs) {
    // Fillcolor can be either the color of the stroke or the fill color or the color of the icon.
    if (geometryType === 'Point' && iconArgs?.color) {
        return getFeatureStyleColor([iconArgs.color.r, iconArgs.color.g, iconArgs.color.b])
    } else if (['LineString', 'Point'].includes(geometryType) && style.getStroke()) {
        return getFeatureStyleColor(style.getStroke().getColor())
    } else if (geometryType === 'Polygon' && style.getFill()) {
        return getFeatureStyleColor(style.getFill().getColor())
    } else {
        return RED
    }
}

/**
 * Get the geoadmin editable feature for the given open layer KML feature
 *
 * @param {Feature} kmlFeature Open layer KML feature
 * @param {kmlLayer} kmlLayer Open layer KML layer
 * @param {DrawingIconSet[]} availableIconSets
 * @returns {EditableFeature | null} Returns EditableFeature or null if this is not a geoadmin
 *   feature
 */
export function getEditableFeatureFromKmlFeature(kmlFeature, kmlLayer, availableIconSets) {
    if (!(kmlFeature instanceof Feature)) {
        log.error(`Cannot generate EditableFeature from KML feature`, kmlFeature)
        return null
    }
    const featureType = getFeatureType(kmlFeature)
    if (!featureType) {
        log.debug('External KML detected, cannot modify it to an EditableFeature')
        return null
    }
    // The kml parser automatically created a style based on the "<style>" part of the feature in the kml file.
    // We will now analyse this style to retrieve all information we need to generate the editable feature.
    const style = getStyle(kmlFeature)
    if (!style) {
        log.error('Parsing error: Could not get the style from the ol Feature', kmlFeature)
        return null
    }
    const featureId = kmlFeature.getId()

    // facultative on marker, never present on measure and linepolygon
    const title = kmlFeature.get('name') ?? ''
    const textScale = getTextScale(style)
    const textSize = getTextSize(textScale)
    const textColor = getTextColor(style)
    const textOffset = kmlFeature?.get('textOffset')?.split(',').map(Number) ?? DEFAULT_TITLE_OFFSET

    const description = kmlFeature.get('description') ?? ''

    const iconStyle = getIconStyle(style)
    const iconArgs = iconStyle ? parseIconUrl(iconStyle.getSrc()) : null
    if (iconArgs?.isLegacy) {
        // On the legacy drawing, openlayer used the scale from xml as is, but since openlayer
        // version 6.7, the scale has been normalized to 32 pixels, therefore we need to add the
        // 32 pixel scale factor below
        // scale_factor := iconStyle.getSize()[0] / 32
        // iconStyle.getSize()[0] = 48 (always 48 pixel on old viewer)
        // scale_factor = 48/32 => 1.5
        iconStyle.setScale(iconStyle.getScale() * LEGACY_ICON_XML_SCALE_FACTOR)
    }
    const icon = iconArgs ? getIcon(iconArgs, iconStyle, availableIconSets) : null
    const iconSize = iconStyle ? getIconSize(iconStyle) : null
    const fillColor = getFillColor(style, kmlFeature.getGeometry().getType(), iconArgs)

    const geometry = new GeoJSON().writeGeometryObject(kmlFeature.getGeometry())
    const coordinates = extractOlFeatureCoordinates(kmlFeature)

    if (iconArgs?.isLegacy && iconStyle && icon) {
        // The legacy drawing uses icons from old URLs, some of them have already been removed
        // like the versioned URLs (/{version}/img/maki/{image}-{size}@{scale}x.png) while others
        // will be probably removed in the near future. Therefore we overwrite those legacy icons
        // urls using the new service icons here, before the icons are fetched.
        // NOTE: we need to do this here and cannot use the iconUrlFunction of the ol/KML constructor
        // because for the url translation we need to have the available iconsets which we don't
        // always have when using iconUrlFunction
        log.warn(`Legacy icons style detected overwritting the style with the new icon url`)
        const newIconStyle = new IconStyle({
            opacity: iconStyle.getOpacity(),
            rotation: iconStyle.getRotation(),
            scale: iconStyle.getScale(),
            rotateWithView: iconStyle.getRotateWithView(),
            displacement: iconStyle.getDisplacement(),
            declutterMode: iconStyle.getDeclutterMode(),
            anchor: iconStyle.getAnchor(),
            anchorOrigin: iconStyle.anchorOrigin,
            anchorXUnits: iconStyle.anchorXUnits,
            anchorYUnits: iconStyle.anchorYUnits,
            src: icon.generateURL(fillColor),
        })
        style.setImage(newIconStyle)
    }

    return new EditableFeature({
        id: featureId,
        featureType: featureType,
        title,
        description: description,
        coordinates,
        geometry,
        textOffset,
        textColor,
        textSize,
        fillColor,
        icon,
        iconSize,
    })
}

const nonGeoadminIconUrls = new Set()
export function iconUrlProxyFy(url, corsIssueCallback = null, httpIssueCallBack = null) {
    // We only proxyfy URL that are not from our backend.
    if (!/^(https:\/\/[^/]*(bgdi\.ch|geo\.admin\.ch)|https?:\/\/localhost)/.test(url)) {
        if (url.startsWith('http:') && httpIssueCallBack) {
            log.warn(`KML Icon url ${url} has an http scheme`)
            httpIssueCallBack(url)
        }
        const proxyUrl = proxifyUrl(url)
        // Only perform the CORS check if we have a callback and it has not yet been done
        if (!nonGeoadminIconUrls.has(url) && corsIssueCallback) {
            nonGeoadminIconUrls.add(url)
            log.warn(`Non geoadmin KML Icon url detected, checking CORS: ${url}`)
            // Detected non geoadmin URL, in this case always use the proxy to avoid CORS errors as
            // this method is synchrone.
            // but still check for CORS support asynchronously to set a user warning if needed.
            axios
                .head(url, {
                    timeout: 10 * 1000,
                })
                .then((response) => {
                    log.debug(`KML Icon url ${url} support CORS:`, response)
                })
                .catch((error) => {
                    log.warn(`KML Icon url ${url} do not support CORS`, error)
                    if (corsIssueCallback) {
                        corsIssueCallback(url, error)
                    }
                })
        }

        log.debug(`KML icon change url from ${url} to ${proxyUrl}`)
        return proxyUrl
    }
    return url
}

function handleIconUrl(url, iconUrlProxy = iconUrlProxyFy, files = new Map()) {
    // Check if the url is relative to the web application
    // To do this we take the location origin with the path, making sure that the path is the folder
    // and not a file.
    const localPrefix = `${location.origin}${location.pathname.replace(/[^/]+$/, '')}`
    if (url.startsWith(localPrefix)) {
        // url is relative file, try to get it from the kml link files
        const file = url.replace(localPrefix, '')
        if (files.has(file)) {
            return URL.createObjectURL(new Blob([files.get(file)]))
        }
        return url
    } else if (/^https?:\/\//.test(url)) {
        // the url is a remote url we might need to go through our proxy to avoid CORS
        // issues and allow mix content.
        return iconUrlProxy(url)
    }
    // otherwise fallback by returning the url. This can be the case for inline icon
    // like data:image/png;base64,...
    return url
}

/**
 * Parses a KML's data into OL Features
 *
 * @param {KMLLayer} kmlLayer KML layer to parse
 * @param {CoordinateSystem} projection Projection to use for the OL Feature
 * @param {DrawingIconSet[]} iconSets Icon sets to use for EditabeFeature deserialization
 * @returns {ol/Feature[]} List of OL Features
 */
export function parseKml(kmlLayer, projection, iconSets, iconUrlProxy = iconUrlProxyFy) {
    const kmlData = kmlLayer.kmlData
    const files = kmlLayer.linkFiles
    const features = new KML({
        iconUrlFunction: (url) => handleIconUrl(url, iconUrlProxy, files),
    }).readFeatures(kmlData, {
        dataProjection: WGS84.epsg, // KML files should always be in WGS84
        featureProjection: projection.epsg,
    })
    // we do not force our DrawingModule styling (especially colors) to external/non-drawing KMLs
    if (!kmlLayer.isExternal) {
        features.forEach((olFeature) => {
            const editableFeature = getEditableFeatureFromKmlFeature(olFeature, kmlLayer, iconSets)

            if (editableFeature) {
                // Set the EditableFeature coordinates from the olFeature geometry
                editableFeature.setCoordinatesFromFeature(olFeature)
                olFeature.set('editableFeature', editableFeature)
                olFeature.setStyle(featureStyleFunction)

                if (editableFeature.isLineOrMeasure()) {
                    /* The featureStyleFunction uses the geometries calculated in the geodesic object
                    if present. The lines connecting the vertices of the geometry will appear
                    geodesic (follow the shortest path) in this case instead of linear (be straight on
                    the screen)  */
                    olFeature.set('geodesic', new GeodesicGeometries(olFeature, projection))
                }
            }
        })
    }

    return features
}

export class EmptyKMLError extends Error {}
export class KMZError extends Error {}

/**
 * Unzipped KMZ Object
 *
 * This class wrap the unzipped content of a KMZ archive.
 *
 * @class
 * @property {string} name Name of the KMZ archive
 * @property {string} kml Content of the KML file within the KMZ archive (unzipped)
 * @property {Map<string, ArrayBuffer>} files A Map of files with their absolute path as key and
 *   their unzipped content as ArrayBuffer
 */
export class KMZObject {
    constructor(params = {}) {
        const { name = null, kml = null, files = new Map() } = params
        this.name = name
        this.kml = kml
        this.files = files
    }
}

/**
 * Unzipped a KMZ archive following the KMZ google specification.
 *
 * See https://developers.google.com/kml/documentation/kmzarchives
 *
 * @param {string} kmzContent KMZ archive content as string
 * @param {string} kmzFileName KMZ archive name
 * @returns {KMZObject} Returns a KMZ unzip object
 */
export async function unzipKmz(kmzContent, kmzFileName) {
    const kmz = new KMZObject({ name: kmzFileName })
    const zip = new JSZip()
    try {
        await zip.loadAsync(kmzContent)
    } catch (error) {
        log.error(`Failed to unzip KMZ file ${kmzFileName}: ${error}`)
        throw new KMZError(`Failed to unzip KMZ file ${kmzFileName}`)
    }

    try {
        // Valid KMZ archive must have 1 KML file with .kml extension
        kmz.kml = await zip.file(/^.*\.kml$/)[0].async('text')
    } catch (error) {
        log.error(`Failed to get KML file from KMZ archive ${kmzFileName}: ${error}`)
        throw new KMZError(`Failed to get KML file from KMZ archive ${kmzFileName}`)
    }

    // Get all other files from the archive
    const files = zip.file(/^(?!.*\.kml$).*$/)
    for (let i = 0; i < files.length; i++) {
        const file = files[i]
        try {
            kmz.files.set(file.name, await file.async('arraybuffer'))
        } catch (error) {
            log.error(
                `Failed to extract file ${file.name} from KMZ archive ${kmzFileName}: ${error}. File is ignored`
            )
        }
    }

    return kmz
}
