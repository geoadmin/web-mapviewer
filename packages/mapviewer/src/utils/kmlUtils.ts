import type { KMLLayer } from '@geoadmin/layers'
import type { Extent as OLExtent } from 'ol/extent'
import type { Size } from 'ol/size'

import { CoordinateSystem, WGS84 } from '@geoadmin/coordinates'
import { KmlStyle } from '@geoadmin/layers'
import { layerUtils } from '@geoadmin/layers/utils'
import log from '@geoadmin/log'
import { kml as kmlToGeoJSON } from '@tmcw/togeojson'
import { booleanValid } from '@turf/turf'
import axios from 'axios'
import JSZip from 'jszip'
import {
    createEmpty as emptyExtent,
    extend as extendExtent,
    isEmpty as isExtentEmpty,
} from 'ol/extent'
import OLFeature from 'ol/Feature'
import GeoJSON from 'ol/format/GeoJSON'
import IconStyle from 'ol/style/Icon'
import Style from 'ol/style/Style'

import EditableFeature, { EditableFeatureTypes } from '@/api/features/EditableFeature.class.js'
import { extractOlFeatureCoordinates } from '@/api/features/features.api.js'
import { proxifyUrl } from '@/api/file-proxy.api'
import { DEFAULT_TITLE_OFFSET, DrawingIcon, type DrawingIconSet, generateURL } from '@/api/icon.api'
import { getServiceKmlBaseUrl } from '@/config/baseUrl.config'
import { LOCAL_OR_INTERNAL_URL_REGEX } from '@/config/regex.config'
import {
    allStylingSizes,
    allStylingTextPlacements,
    calculateTextOffsetFromPlacement,
    calculateTextXYOffset,
    type FeatureStyleColor,
    type FeatureStyleSize,
    geoadminStyleFunction,
    getFeatureStyleColor,
    getStyle,
    getTextColor,
    getTextSize,
    RED,
    SMALL,
    UNKNOWN,
} from '@/utils/featureStyleUtils.ts'
import { GeodesicGeometries } from '@/utils/geodesicManager'
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

const kmlReader = new KML({ extractStyles: false })

/** Read the KML name */
export function parseKmlName(content: string): string | undefined {
    return kmlReader.readName(content)
}

/**
 * Get KML extent
 *
 * @returns KML layer extent in WGS84 projection or undfeind if the KML has no features
 */
export function getKmlExtent(content: string): OLExtent | undefined {
    const features = kmlReader.readFeatures(content, {
        dataProjection: WGS84.epsg, // KML files should always be in WGS84
        featureProjection: WGS84.epsg,
    })
    const extent = emptyExtent()
    features
        // guarding against empty/null geometry (in case the KML feature doesn't declare any coordinate)
        .filter((feature) => feature.getGeometry() && feature.getGeometry()!.getExtent())
        .forEach((feature) => {
            extendExtent(extent, feature.getGeometry()!.getExtent())
        })
    if (isExtentEmpty(extent)) {
        return
    }
    return extent
}

/**
 * Get the description of all features in the KML content in form of a Map with the feature ID as
 * key
 *
 * @returns Map of feature ID to description
 */
export function getFeatureDescriptionMap(content: string): Map<string, string> {
    const features = kmlReader.readFeatures(content, {
        dataProjection: WGS84.epsg, // KML files should always be in WGS84
        featureProjection: WGS84.epsg,
    })
    const descriptionMap = new Map()
    features.forEach((feature) => {
        const description = feature.get('description')
        if (description) {
            const featureId = feature.getId()
            descriptionMap.set(featureId, description)
        }
    })
    return descriptionMap
}

/**
 * Get the KML feature type
 *
 * The type is taken from the geoadmin proprietary "type" property, and if this property is not
 * available, it means that it is not a Geoadmin drawing and is therefore returning null.
 *
 * @param kmlFeature Open layer kml feature
 * @returns KML feature type or null if this is not a geoadmin kml feature
 */
export function getFeatureType(kmlFeature: OLFeature): EditableFeatureTypes | undefined {
    let featureType = kmlFeature.get('type')?.toUpperCase() // only set by geoadmin's kml
    const kmlFeatureId = kmlFeature.getId()
    if (!featureType && kmlFeatureId !== undefined) {
        // Very old geoadmin KML don't have the type property but the type can be taken from the
        // id
        log.debug(
            `Missing feature type property trying to guess it from the feature ID: ${kmlFeature.getId()}`
        )
        featureType = /(?<type>\w+)_\d+/.exec(`${kmlFeatureId}`)?.groups?.type?.toUpperCase()
    }

    if (!Object.values(EditableFeatureTypes).includes(featureType)) {
        log.info(
            `Type ${featureType} of feature in kml not recognized, not a geoadmin feature ignoring it`,
            kmlFeature
        )
        return
    }
    return featureType
}

/**
 * Get feature text scale from style
 *
 * @param style
 * @returns Return text scale or null if not found
 */
export function getTextScale(style: Style): number | Size | undefined {
    // When exporting the kml, the parser does not put a scale property when the scale is 1.
    // But when importing the kml, it seems that the parser interprets the lack of a scale
    // property as if the scale was 0.8, which is strange. The code below tries to fix that.
    const textScale = style.getText()?.getScale()
    if (textScale === getDefaultStyle()?.getText()?.getScale()) {
        return 1
    }
    return textScale
}

/**
 * Get KML icon style
 *
 * @param style
 * @returns Returns the KML icon style if present otherwise null
 */
export function getIconStyle(style: Style): IconStyle | undefined {
    if (!style) {
        return
    }
    const icon = style.getImage()
    if (!(icon instanceof IconStyle)) {
        return
    }
    // To interpret the KMLs the same way as GoogleEarth, the kml parser automatically adds a Google icon
    // if no icon is present (i.e. for our text feature type), but we do not want that.
    if (
        icon?.getSrc()?.match(/google/) ||
        icon?.getSrc() === getDefaultStyle()?.getImage()?.getSrc()
    ) {
        return
    }
    return icon
}

interface IconColorArgs {
    r: number
    g: number
    b: number
}

interface IconArgs {
    set: string
    name: string
    color: IconColorArgs
    isLegacy: boolean
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
 * @param url URL string
 * @returns Returns the parsed URL or null in case of invalid non recognize url
 */
export function parseIconUrl(url?: string): IconArgs | undefined {
    if (!url) {
        return
    }
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

    if (!match || !match.groups) {
        log.warn(`Could not retrieve icon infos from URL ${url}`)
        return
    }

    const setName = match.groups.set ?? 'default'
    const name = match.groups.name ?? 'unknown'
    const isLegacy = !!(legacyDefaultMatch || legacyUrlDefaultMatch || legacySetMatch)

    return {
        set: setName,
        name,
        color: {
            r: parseRGBColor(match.groups.r ?? 255),
            g: parseRGBColor(match.groups.g ?? 0),
            b: parseRGBColor(match.groups.b ?? 0),
        },
        isLegacy,
    }
}

/**
 * Generates an icon that has the url of the given olIcon
 *
 * This is used for non geoadmin KMLs
 */
function generateIconFromStyle(iconStyle: IconStyle, iconArgs: IconArgs): DrawingIcon | undefined {
    if (!iconStyle || !iconArgs) {
        return
    }
    iconStyle.setDisplacement([0, 0])
    const url = iconStyle.getSrc()
    const size = iconStyle.getSize()
    let anchor = iconStyle.getAnchor()
    try {
        anchor[0] /= size[0]
        anchor[1] /= size[1]
    } catch (error) {
        log.error(
            `Failed to compute icon anchor: anchor=${anchor.join(',')}, size=${size.join(',')}`,
            error
        )
        anchor = [0, 0]
    }

    if (!url || !anchor) {
        return
    }
    return {
        name: iconArgs.name,
        imageURL: url,
        imageTemplateURL: url,
        iconSetName: iconArgs.set,
        anchor: anchor as [number, number],
        size: size as [number, number],
    }
}

/**
 * Get KML drawing icon from style
 *
 * This returns null if the icon is not a geoadmin icon, but returns a default icon if the icon
 * cannot be found in the icon list.
 */
export function getIcon(
    iconArgs: IconArgs,
    iconStyle: IconStyle | undefined,
    availableIconSets: DrawingIconSet[] = [],
    iconNotFoundCallback?: () => void
): DrawingIcon | undefined {
    if (!iconArgs || !iconStyle) {
        return
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
 */
function getIconSize(iconStyle: IconStyle): FeatureStyleSize {
    const iconScale = iconStyle.getScale()
    if (iconScale) {
        return allStylingSizes.find((size) => size.iconScale === iconScale) ?? SMALL
    }
    return SMALL
}

/**
 * Get the fill color from icon arguments or style
 *
 * @returns Returns fill color (default RED if not found in style)
 */
export function getFillColor(
    style: Style,
    geometryType: string,
    iconArgs?: IconArgs
): FeatureStyleColor {
    // Fill color can be either the color of the stroke or the fill color or the color of the icon.
    if (geometryType === 'Point' && iconArgs?.color) {
        return getFeatureStyleColor([iconArgs.color.r, iconArgs.color.g, iconArgs.color.b])
    }

    const stroke = style.getStroke()
    if (stroke && ['LineString', 'Point'].includes(geometryType)) {
        return getFeatureStyleColor(stroke.getColor())
    }

    const fill = style.getFill()
    if (fill && geometryType === 'Polygon' && style.getFill()) {
        return getFeatureStyleColor(fill.getColor())
    }

    return RED
}

/**
 * Get the geoadmin editable feature for the given open layer KML feature
 *
 * @returns Returns EditableFeature or undefined if this is not a geoadmin feature
 */
export function getEditableFeatureFromKmlFeature(
    kmlFeature: OLFeature,
    availableIconSets: DrawingIconSet[]
): EditableFeature | undefined {
    if (!kmlFeature) {
        log.error({
            title: 'kmlUtils / getEditableFeatureFromKmlFeature',
            messages: [`Cannot generate EditableFeature from KML feature`, kmlFeature],
        })
        return
    }
    const featureType = getFeatureType(kmlFeature)
    if (!featureType) {
        log.debug({
            title: 'kmlUtils / getEditableFeatureFromKmlFeature',
            messages: ['External KML detected, cannot modify it to an EditableFeature', kmlFeature],
        })
        return
    }
    // The kml parser automatically created a style based on the "<style>" part of the feature in the kml file.
    // We will now analyse this style to retrieve all information we need to generate the editable feature.
    const style = getStyle(kmlFeature)
    if (!style) {
        log.error({
            title: 'kmlUtils / getEditableFeatureFromKmlFeature',
            messages: ['Parsing error: Could not get the style from the ol Feature', kmlFeature],
        })
        return
    }
    const featureId = kmlFeature.getId()
    if (!featureId) {
        log.debug({
            title: 'kmlUtils / getEditableFeatureFromKmlFeature',
            messages: ['No feature ID found, could not parse feature', kmlFeature],
        })
        return
    }

    // facultative on marker, never present on measure and linepolygon
    const title: string = kmlFeature.get('name') ?? ''
    const textScale = getTextScale(style)
    const textSize = getTextSize(textScale)
    const textColor = getTextColor(style)
    const textOffset = kmlFeature.get('textOffset')?.split(',').map(Number) ?? DEFAULT_TITLE_OFFSET

    const description = kmlFeature.get('description') ?? ''

    const iconStyle = getIconStyle(style)
    let iconArgs: IconArgs | undefined
    if (iconStyle) {
        iconArgs = parseIconUrl(iconStyle.getSrc())
        if (iconArgs?.isLegacy) {
            const legacyScale = iconStyle.getScale()
            // On the legacy drawing, OpenLayer used the scale from XML as is, but since OpenLayer
            // version 6.7 the scale has been normalized to 32 pixels. We therefore need to add the
            // 32-pixel scale factor below.
            // Scale factor:= iconStyle.getSize()[0] / 32
            // iconStyle.getSize()[0] = 48 (always 48 pixel on old viewer)
            // scale_factor = 48/32 => 1.5
            if (Array.isArray(legacyScale)) {
                iconStyle.setScale(legacyScale.map((value) => value * LEGACY_ICON_XML_SCALE_FACTOR))
            } else {
                iconStyle.setScale(legacyScale * LEGACY_ICON_XML_SCALE_FACTOR)
            }
        }
    }
    const icon = iconArgs ? getIcon(iconArgs, iconStyle, availableIconSets) : null
    const iconSize = iconStyle ? getIconSize(iconStyle) : null

    const featureGeometry = kmlFeature.getGeometry()
    const featureGeometryType = featureGeometry?.getType()
    if (!featureGeometry || !featureGeometryType) {
        return
    }

    const fillColor = getFillColor(style, featureGeometryType, iconArgs)

    const geometry = new GeoJSON().writeGeometryObject(featureGeometry)
    const coordinates = extractOlFeatureCoordinates(kmlFeature)
    const textPlacement = detectTextPlacement(
        textScale,
        iconStyle?.getScale(),
        icon?.anchor,
        icon?.size,
        title,
        textOffset
    )
    // Convert string to boolean - KML properties are parsed as strings
    const showDescriptionOnMapValue = kmlFeature.get('showDescriptionOnMap')
    const showDescriptionOnMap = showDescriptionOnMapValue === 'true' || showDescriptionOnMapValue === true
    if (iconArgs?.isLegacy && iconStyle && icon) {
        // The legacy drawing uses icons from old URLs, some of them have already been removed
        // like the versioned URLs (/{version}/img/maki/{image}-{size}@{scale}x.png) while others
        // will be probably removed in the near future. Therefore we overwrite those legacy icons
        // urls using the new service icons here, before the icons are fetched.
        // NOTE: we need to do this here and cannot use the iconUrlFunction of the ol/KML constructor
        // because for the url translation we need to have the available iconsets which we don't
        // always have when using iconUrlFunction
        log.warn(`Legacy icons style detected overwritting the style with the new icon url`)
        const newIconStyle = iconStyle.clone()
        newIconStyle.setSrc(generateURL(icon, fillColor))
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
        textPlacement,
        showDescriptionOnMap,
    })
}

/**
 * Detect the feature text placement based on the icon and text size
 *
 * @param {Number} textScale Text scaling
 * @param {Number} iconScale Icon scaling
 * @param {Array} anchor Relative position of Anchor
 * @param {Array} iconSize Absolute size of icon in pixel
 * @param {String} text Text to display
 * @param {Array} currentTextOffset Current text offset of the kml feature
 * @returns {TextPlacement} Returns the text placement or undefined if the icon is not a marker
 */
function detectTextPlacement(textScale, iconScale, anchor, iconSize, text, currentTextOffset) {
    if (!text || !textScale || !iconScale || !anchor || !iconSize) {
        return UNKNOWN
    }
    const [textPlacementX, textPlacementY] = calculateTextXYOffset(
        textScale,
        iconScale,
        anchor,
        iconSize,
        text
    )

    for (const placementOption of allStylingTextPlacements) {
        const [xOffset, yOffset] = calculateTextOffsetFromPlacement(
            textPlacementX,
            textPlacementY,
            placementOption
        )
        if (xOffset === currentTextOffset[0] && yOffset === currentTextOffset[1]) {
            return placementOption
        }
    }
    return UNKNOWN
}

const nonGeoadminIconUrls = new Set()

export type iconProxyficationErrorCallback = (url: string, error?: any) => void
export type iconUrlProxyficationFunction = (
    url: string,
    corsIssueCallback?: iconProxyficationErrorCallback,
    httpIssueCallback?: iconProxyficationErrorCallback
) => string

export function defaultIconUrlProxyfication(
    url: string,
    corsIssueCallback?: iconProxyficationErrorCallback,
    httpIssueCallBack?: iconProxyficationErrorCallback
): string {
    // We only proxyfy URL that are not from our backend.
    if (!LOCAL_OR_INTERNAL_URL_REGEX.test(url)) {
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

/**
 * Check if the url is relative to the web application. To do this, we take the location origin with
 * the path, making sure that the path is the folder and not a file.
 */
function handleIconUrl(
    url: string,
    iconUrlProxy: iconUrlProxyficationFunction = defaultIconUrlProxyfication,
    filesInsideKML: Map<string, ArrayBuffer> = new Map()
): string {
    const localPrefix = `${location.origin}${location.pathname.replace(/[^/]+$/, '')}`
    if (url.startsWith(localPrefix)) {
        // URL is a relative file, try to get it from the KML link files
        const file = url.replace(localPrefix, '')
        if (filesInsideKML.has(file) && filesInsideKML.get(file) !== undefined) {
            return URL.createObjectURL(new Blob([filesInsideKML.get(file) as ArrayBuffer]))
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

/** Parses a KML's data into OL Features */
export function parseKml(
    kmlLayer: KMLLayer,
    projection: CoordinateSystem,
    iconSets: DrawingIconSet[],
    iconUrlProxy: iconUrlProxyficationFunction = defaultIconUrlProxyfication
) {
    const kmlData = kmlLayer.kmlData
    const files = kmlLayer.internalFiles
    const features = new KML({
        iconUrlFunction: (url) => handleIconUrl(url, iconUrlProxy, files),
    }).readFeatures(kmlData, {
        dataProjection: WGS84.epsg, // KML files should always be in WGS84
        featureProjection: projection.epsg,
    })
    if (kmlLayer.style === KmlStyle.GEOADMIN) {
        features.forEach((olFeature) => {
            const editableFeature = getEditableFeatureFromKmlFeature(olFeature, iconSets)
            if (editableFeature) {
                // Set the EditableFeature coordinates from the olFeature geometry
                editableFeature.setCoordinatesFromFeature(olFeature)
                olFeature.set('editableFeature', editableFeature)

                if (editableFeature.isLineOrMeasure()) {
                    /* The featureStyleFunction uses the geometries calculated in the geodesic object
                    if present. The lines connecting the vertices of the geometry will appear
                    geodesic (follow the shortest path) in this case instead of linear (be straight on
                    the screen)  */
                    olFeature.set('geodesic', new GeodesicGeometries(olFeature, projection))
                }
            }
            olFeature.setStyle(geoadminStyleFunction)
        })
    }

    return features
}

/**
 * Check if the KML features are valid
 *
 * @param {string} kmlData KML data
 * @returns {boolean} Returns true if the KML data is valid, false otherwise
 */
export function isKmlFeaturesValid(kmlData) {
    try {
        const kmlDom = new DOMParser().parseFromString(kmlData, 'text/xml')
        const kmlGeoJson = kmlToGeoJSON(kmlDom, { styles: false })

        const invalidFeatures = kmlGeoJson.features.filter((feature) => !booleanValid(feature))
        const errorsCount = invalidFeatures.length
        if (errorsCount > 0) {
            log.warn(`KML file contains ${errorsCount} invalid feature(s)`)
            return false
        }

        return true
    } catch (error) {
        log.error(`Failed to parse or validate KML file: ${error.message || error}`)
        return false
    }
}

export class KMZError extends Error {}

/**
 * Unzipped KMZ Object
 *
 * This class wrap the unzipped content of a KMZ archive.
 *
 * @class
 * @property {string} name Name of the KMZ archive
 * @property {ArrayBuffer} kml Content of the KML file within the KMZ archive (unzipped)
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
 * @param {ArrayBuffer} kmzContent KMZ archive content
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
        kmz.kml = await zip.file(/^.*\.kml$/)[0].async('arraybuffer')
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

/**
 * Wrapper around the layers module's KML layer factory
 *
 * This is necessary as the instantiation of a KML Layer has so much logic that's coupled to the
 * mapviewer that we can't currently abstract away to the layers module
 *
 * @param {Values for creating a KML layer} values
 * @returns
 */
export const makeKmlLayer = (values) => {
    const isLocalFile = values.kmlFileUrl ? !values.kmlFileUrl.startsWith('http') : false
    const attributionName = isLocalFile
        ? values.kmlFileUrl
        : new URL(values.kmlFileUrl || '').hostname

    const attributions = [{ name: attributionName }]
    const baseUrl = getServiceKmlBaseUrl()
    const isExternal = values.kmlFileUrl?.indexOf(baseUrl) === -1

    // Based on the service-kml API reference, the KML file URL has the following structure
    // <base-url>/kml/files/{kml_id} or <base-url>/{kml_id} for legacy files. Those one are
    // redirected to <base-url>/kml/files/{kml_id}
    const fileId = !isLocalFile && !isExternal ? values.kmlFileUrl?.split('/').pop() : null

    let name,
        isLoading = true

    if (values.kmlData) {
        name = parseKmlName(values.kmlData)
        if (!name || name === '') {
            name = isLocalFile
                ? values.kmlFileUrl
                : // only keeping what is after the last slash
                  values.kmlFileUrl.split('/').pop()
        }
        isLoading = false
    }

    let style = values.style
    if (!style) {
        // if no style was given, we select the default style depending on the origin of the KML
        style = isExternal ? KmlStyle.DEFAULT : KmlStyle.GEOADMIN
    }

    const clampToGround = (values.clampToGround ?? true) ? !isExternal : values.clampToGround

    return layerUtils.makeKmlLayer({
        ...values,
        baseUrl: values.kmlFileUrl,
        id: values.kmlFileUrl,
        isLocalFile,
        attributions,
        isExternal,
        fileId,
        name: name || 'KML',
        isLoading,
        style,
        clampToGround,
    })
}
