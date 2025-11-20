import type { CoordinateSystem, FlatExtent } from '@swissgeo/coordinates'
import { WGS84 } from '@swissgeo/coordinates'
import type { KMLLayer } from '@swissgeo/layers'
import { KMLStyle } from '@swissgeo/layers'
import type { Geometry } from 'ol/geom'
import type { Type as GeometryType } from 'ol/geom/Geometry'
import type { Size } from 'ol/size'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import { kml as kmlToGeoJSON } from '@tmcw/togeojson'
import { booleanValid } from '@turf/turf'
import axios from 'axios'
import JSZip from 'jszip'
import {
    createEmpty as emptyExtent,
    extend as extendExtent,
    isEmpty as isExtentEmpty,
} from 'ol/extent'
import Feature from 'ol/Feature'
import GeoJSON, { type GeoJSONGeometry, type GeoJSONGeometryCollection } from 'ol/format/GeoJSON'
import KML, { getDefaultStyle } from 'ol/format/KML'
import IconStyle from 'ol/style/Icon'
import Style from 'ol/style/Style'

import type { EditableFeature } from '@/api/features.api'
import { EditableFeatureTypes, extractOlFeatureCoordinates } from '@/api/features.api'
import { proxifyUrl } from '@/api/file-proxy.api'
import { type DrawingIcon, type DrawingIconSet, generateIconURL } from '@/api/icon.api'
import { DEFAULT_TITLE_OFFSET } from '@/config/icons.config'
import { LOCAL_OR_INTERNAL_URL_REGEX } from '@/config/regex.config'
import {
    allStylingSizes,
    calculateTextOffsetFromPlacement,
    calculateTextXYOffset,
    type FeatureStyleColor,
    type FeatureStyleSize,
    geoadminStyleFunction,
    getFeatureStyleColor,
    getStyle,
    getTextColor,
    getTextSize,
    MEDIUM,
    RED,
    SMALL,
    TextPlacement,
} from '@/utils/featureStyleUtils'
import { isAnyEnumValue, parseRGBColor } from '@/utils/utils'

export const EMPTY_KML_DATA: string = '<kml></kml>'

// On the legacy drawing, openlayer used the scale from xml as is, but since openlayer
// version 6.7, the scale has been normalized to 32 pixels, therefore we need to add the
// 32 pixel scale factor below
// scale_factor := iconStyle.getSize()[0] / 32
// iconStyle.getSize()[0] = 48 (always 48 pixel on old viewer)
// scale_factor = 48/32 => 1.5
// See https://github.com/openlayers/openlayers/pull/12695
export const LEGACY_ICON_XML_SCALE_FACTOR: number = 1.5

const kmlReader = new KML({ extractStyles: false })

export function parseKmlName(content: string): string | undefined {
    return kmlReader.readName(content)
}

/**
 * Get KML extent
 *
 * @param content KML content
 * @returns KML layer extent in WGS84 projection or null if the KML has no features
 */
export function getKmlExtent(content: string): FlatExtent | undefined {
    const features = kmlReader.readFeatures(content, {
        dataProjection: WGS84.epsg, // KML files should always be in WGS84
        featureProjection: WGS84.epsg,
    })
    const extent = emptyExtent()
    features
        // guarding against empty/null geometry (in case the KML feature doesn't declare any coordinate)
        .filter((feature) => !!feature.getGeometry()?.getExtent())
        .forEach((feature) => {
            extendExtent(extent, feature.getGeometry()!.getExtent())
        })
    if (isExtentEmpty(extent)) {
        return
    }
    return extent as FlatExtent
}

/**
 * Get the description of all features in the KML content in form of a Map with the feature ID as
 * key
 *
 * @param content KML content
 * @returns Map of feature ID to description
 */
export function getFeatureDescriptionMap(content: string): Map<string, string> {
    const features = kmlReader.readFeatures(content, {
        dataProjection: WGS84.epsg, // KML files should always be in WGS84
        featureProjection: WGS84.epsg,
    })
    const descriptionMap = new Map<string, string>()
    features.forEach((feature) => {
        const description = feature.get('description')
        if (description) {
            const featureId = feature.getId()
            if (featureId !== undefined) {
                descriptionMap.set(`${featureId}`, description)
            }
        }
    })
    return descriptionMap
}

/**
 * Get the KML feature type
 *
 * The type is taken from the geoadmin proprietary "type" property, and if this property is not
 * available it means that it is not a Geoadmin drawing and is therefore returning undefined.
 *
 * @param kmlFeature Open layer kml feature
 * @returns KML feature type or undefined if this is not a geoadmin kml feature
 */
export function getFeatureType(kmlFeature: Feature): string | undefined {
    let featureType = kmlFeature.get('type')?.toUpperCase() // only set on mf-geoadmin3's KML (legacy)
    if (!featureType) {
        featureType = kmlFeature.get('editableFeature')?.featureType
    }
    const featureId = kmlFeature.getId()
    if (!featureType && featureId) {
        // Very old geoadmin KML don't have the type property but the type can be taken from the
        // id
        log.debug({
            title: 'kmlUtils / getFeatureType',
            titleColor: LogPreDefinedColor.Lime,
            messages: [
                `Missing feature type property trying to guess it from the feature ID: ${featureId}`,
            ],
        })
        featureType = /(?<type>\w+)_\d+/.exec(`${featureId}`)?.groups?.type?.toUpperCase()
    }
    if (!featureType || !isAnyEnumValue(EditableFeatureTypes, featureType)) {
        log.info({
            title: 'kmlUtils / getFeatureType',
            titleColor: LogPreDefinedColor.Lime,
            messages: [
                `Type ${featureType} of feature in kml not recognized, not a geoadmin feature ignoring it`,
                kmlFeature,
            ],
        })
        return
    }
    return featureType
}

/**
 * Get feature text scale from style
 *
 * @param style
 * @returns Return text scale or undefined if not found
 */
export function getTextScale(style: Style): number | undefined {
    // When exporting the kml, the parser does not put a scale property when the scale is 1.
    // But when importing the kml, it seems that the parser interprets the lack of a scale
    // property as if the scale was 0.8, which is strange. The code below tries to fix that.
    const textScale = style.getText()?.getScale()
    if (textScale === getDefaultStyle()?.getText()?.getScale()) {
        return 1
    }
    if (Array.isArray(textScale)) {
        return textScale[0]
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
    const icon = style.getImage()
    if (!(icon instanceof IconStyle)) {
        return
    }
    const defaultIcon = getDefaultStyle()?.getImage()
    // To interpret the KMLs the same way as GoogleEarth, the kml parser automatically adds a Google icon
    // if no icon is present (i.e. for our text feature type), but we do not want that.
    if (
        icon.getSrc()?.match(/google/) ||
        (defaultIcon instanceof IconStyle && icon.getSrc() === defaultIcon.getSrc())
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
    color?: IconColorArgs
    isLegacy: boolean
}

/**
 * Parse an Icon URL
 *
 * This handles also the legacy icon url of the following styles:
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
 * @returns Returns the parsed URL or undefined in case of invalid non recognize url
 */
export function parseIconUrl(url: string): IconArgs | undefined {
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
        log.warn({
            title: 'kmlUtils / parseIconUrl',
            titleColor: LogPreDefinedColor.Lime,
            messages: ['Could not retrieve icon infos from URL', url],
        })
        return
    }

    return {
        set: match.groups?.set ?? 'default',
        name: match.groups?.name ?? 'unknown',
        color: {
            r: parseRGBColor(match.groups?.r ?? '255'),
            g: parseRGBColor(match.groups?.g ?? '0'),
            b: parseRGBColor(match.groups?.b ?? '0'),
        },
        isLegacy: !!(legacyDefaultMatch || legacyUrlDefaultMatch || legacySetMatch),
    }
}

/**
 * Generates an icon that has the url of the given olIcon
 *
 * This is used for non-geoadmin KMLs
 */
function generateIconFromStyle(iconStyle: IconStyle, iconArgs: IconArgs): DrawingIcon | undefined {
    if (!iconStyle || !iconArgs) {
        return
    }
    iconStyle.setDisplacement([0, 0])
    const url = iconStyle.getSrc()
    const size = iconStyle.getSize()
    let anchor = iconStyle.getAnchor()

    if (!url) {
        return
    }

    try {
        anchor = anchor.map((value) => value / (size.at(0) ?? 1))
    } catch (error) {
        log.error({
            title: 'kmlUtils / generateIconFromStyle',
            titleColor: LogPreDefinedColor.Lime,
            messages: ['Failed to compute icon anchor', anchor, size, error],
        })
        anchor = [0, 0]
    }

    if (!anchor) {
        log.warn({
            title: 'kmlUtils / generateIconFromStyle',
            titleColor: LogPreDefinedColor.Lime,
            messages: ['No icon anchor found for icon', url, iconArgs],
        })
        return undefined
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
 *
 * @param iconArgs Geoadmin icon arguments
 * @param iconStyle OpenLayers icon style
 * @param availableIconSets
 * @param iconNotFoundCallback
 * @returns The drawing icon or undefined in case of non-geoadmin icon
 */
export function getIcon(
    iconArgs?: IconArgs,
    iconStyle?: IconStyle,
    availableIconSets?: DrawingIconSet[],
    iconNotFoundCallback?: () => void
): DrawingIcon | undefined {
    if (!iconArgs) {
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

    //  Make sure that availableIconSets is an array, if not there will be an error when calling find on it
    if (!availableIconSets || !Array.isArray(availableIconSets)) {
        if (!iconStyle) {
            return
        }
        log.error({
            title: 'kmlUtils / getIcon',
            titleColor: LogPreDefinedColor.Lime,
            messages: ['Icon sets not yet available, falling back to default icon'],
        })
        return generateIconFromStyle(iconStyle, iconArgs)
    }
    const iconSet = availableIconSets.find((drawingIconSet) => drawingIconSet.name === iconArgs.set)
    if (!iconSet) {
        if (iconNotFoundCallback) {
            iconNotFoundCallback()
        } else {
            log.error({
                title: 'kmlUtils / getIcon',
                titleColor: LogPreDefinedColor.Lime,
                messages: [`Icon set ${iconArgs.set} not found, falling back to default icon`],
            })
        }
        if (!iconStyle) {
            return
        }
        return generateIconFromStyle(iconStyle, iconArgs)
    }

    // The icon name on the legacy default set was without numbered prefix, therefore add a
    // regex numbered prefix to it. This allow for the new icon url syntax to do a full match
    // while on legacy default url we use only the name without numbered prefix
    const namePrefix = iconArgs.isLegacy ? '(\\d+-)?' : ''
    const nameRegex = new RegExp(`^${namePrefix}${iconArgs.name}$`)

    const icon = iconSet.icons.find((drawingIcon) => nameRegex.test(drawingIcon.name))
    if (!icon && iconStyle) {
        log.error({
            title: 'kmlUtils / getIcon',
            titleColor: LogPreDefinedColor.Lime,
            messages: [
                `Can not find icon ${iconArgs.name} in set ${iconArgs.set}, fallback to default icon`,
            ],
        })
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
    geometryType: GeometryType,
    iconArgs?: IconArgs
): FeatureStyleColor {
    // Fill color can be either the color of the stroke or the fill color or the color of the icon.
    if (geometryType === 'Point' && iconArgs?.color) {
        return getFeatureStyleColor([iconArgs.color.r, iconArgs.color.g, iconArgs.color.b])
    } else if (['LineString', 'Point'].includes(geometryType) && style.getStroke()) {
        return getFeatureStyleColor(style.getStroke()!.getColor())
    } else if (geometryType === 'Polygon' && style.getFill()) {
        return getFeatureStyleColor(style.getFill()!.getColor())
    } else {
        return RED
    }
}

/**
 * Get the geoadmin editable feature for the given open layer KML feature
 *
 * @param kmlFeature OpenLayers KML feature
 * @param availableIconSets
 * @param resolution
 * @returns EditableFeature or undefined if this is not a geoadmin feature
 */
export function getEditableFeatureFromKmlFeature(
    kmlFeature: Feature | undefined,
    availableIconSets: DrawingIconSet[],
    resolution: number
): EditableFeature | undefined {
    if (!kmlFeature) {
        log.error({
            title: 'kmlUtils / getEditableFeatureFromKmlFeature',
            titleColor: LogPreDefinedColor.Lime,
            messages: [`Cannot generate EditableFeature from KML feature`, kmlFeature],
        })
        return
    }
    const featureType = getFeatureType(kmlFeature)
    if (!featureType || !isAnyEnumValue(EditableFeatureTypes, featureType)) {
        log.debug({
            title: 'kmlUtils / getEditableFeatureFromKmlFeature',
            titleColor: LogPreDefinedColor.Lime,
            messages: ['External KML detected, cannot modify it to an EditableFeature'],
        })
        return
    }
    // The KML parser automatically created a style based on the "<style>" part of the feature in the KML file.
    // We will now analyze this style to retrieve all information we need to generate the editable feature.
    const style = getStyle(kmlFeature, resolution)
    if (!style) {
        log.error({
            title: 'kmlUtils / getEditableFeatureFromKmlFeature',
            titleColor: LogPreDefinedColor.Lime,
            messages: ['Parsing error: Could not get the style from the ol Feature', kmlFeature],
        })
        return
    }
    const featureId = kmlFeature.getId()

    if (!featureId) {
        log.error({
            title: 'kmlUtils / getEditableFeatureFromKmlFeature',
            titleColor: LogPreDefinedColor.Lime,
            messages: [
                'Parsing error: Could not get the feature id from the ol Feature',
                kmlFeature,
            ],
        })
        return
    }

    // facultative on marker, never present on measure and linepolygon
    const title = kmlFeature.get('name') ?? ''
    const textScale = getTextScale(style)
    const textSize = getTextSize(textScale)
    const textColor = getTextColor(style)
    const textOffset = kmlFeature.get('textOffset')?.split(',').map(Number) ?? DEFAULT_TITLE_OFFSET

    const description = kmlFeature.get('description') ?? ''

    const iconStyle = getIconStyle(style)
    const iconArgs = iconStyle?.getSrc() ? parseIconUrl(iconStyle.getSrc()!) : undefined
    if (iconStyle && iconArgs?.isLegacy) {
        // On the legacy drawing, openlayer used the scale from xml as is, but since openlayer
        // version 6.7, the scale has been normalized to 32 pixels, therefore we need to add the
        // 32 pixel scale factor below
        // scale_factor := iconStyle.getSize()[0] / 32
        // iconStyle.getSize()[0] = 48 (always 48 pixel on old viewer)
        // scale_factor = 48/32 => 1.5
        const iconScale = iconStyle.getScale()
        if (Array.isArray(iconScale)) {
            iconStyle.setScale(iconScale.map((value) => value * LEGACY_ICON_XML_SCALE_FACTOR))
        } else {
            iconStyle.setScale(iconScale * LEGACY_ICON_XML_SCALE_FACTOR)
        }
    }
    const icon = iconArgs ? getIcon(iconArgs, iconStyle, availableIconSets) : undefined
    const iconSize = iconStyle ? getIconSize(iconStyle) : MEDIUM
    let fillColor: FeatureStyleColor | undefined

    const kmlGeometry = kmlFeature.getGeometry()
    let geoJsonGeometry: GeoJSONGeometry | GeoJSONGeometryCollection | undefined
    if (kmlGeometry) {
        fillColor = getFillColor(style, kmlGeometry.getType(), iconArgs)
        geoJsonGeometry = new GeoJSON().writeGeometryObject(kmlGeometry)
    }

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
    const showDescriptionOnMap =
        showDescriptionOnMapValue === 'true' || showDescriptionOnMapValue === true
    if (iconArgs?.isLegacy && iconStyle && icon) {
        // The legacy drawing uses icons from old URLs, some of them have already been removed
        // like the versioned URLs (/{version}/img/maki/{image}-{size}@{scale}x.png) while others
        // will be probably removed in the near future. Therefore we overwrite those legacy icons
        // urls using the new service icons here, before the icons are fetched.
        // NOTE: we need to do this here and cannot use the iconUrlFunction of the ol/KML constructor
        // because for the url translation we need to have the available iconsets which we don't
        // always have when using iconUrlFunction
        log.warn({
            title: 'kmlUtils / getEditableFeatureFromKmlFeature',
            titleColor: LogPreDefinedColor.Lime,
            messages: ['Legacy icons style detected overwriting the style with the new icon url'],
        })
        const image = style.getImage()
        if (image instanceof IconStyle) {
            image.setSrc(generateIconURL(icon, fillColor))
        }
    }

    return {
        id: featureId,
        featureType: featureType as EditableFeatureTypes,
        title,
        description: description,
        coordinates,
        geometry: geoJsonGeometry,
        textOffset,
        textColor,
        textSize,
        fillColor,
        icon,
        iconSize,
        textPlacement,
        showDescriptionOnMap,
    } as EditableFeature
}

/**
 * Detect the feature text placement based on the icon and text size
 *
 * @param textScale Text scaling
 * @param iconScale Icon scaling
 * @param anchor Relative position of Anchor
 * @param iconSize Absolute size of icon in pixel
 * @param text Text to display
 * @param currentTextOffset Current text offset of the kml feature
 * @returns Returns the text placement or undefined if the icon is not a marker
 */
function detectTextPlacement(
    textScale?: number,
    iconScale?: number | Size,
    anchor?: [number, number],
    iconSize?: [number, number],
    text?: string,
    currentTextOffset?: [number, number]
): TextPlacement {
    if (!text || !textScale || !iconScale || !anchor || !iconSize || !currentTextOffset) {
        return TextPlacement.Unknown
    }
    const [textPlacementX, textPlacementY] = calculateTextXYOffset(
        textScale,
        iconScale,
        anchor,
        iconSize,
        text
    )

    for (const placementOption of Object.values(TextPlacement)) {
        const [xOffset, yOffset] = calculateTextOffsetFromPlacement(
            textPlacementX,
            textPlacementY,
            placementOption
        )
        if (xOffset === currentTextOffset[0] && yOffset === currentTextOffset[1]) {
            return placementOption as TextPlacement
        }
    }
    return TextPlacement.Unknown
}

const nonGeoadminIconUrls = new Set<string>()
export function iconUrlProxyFy(
    url: string,
    corsIssueCallback?: (url: string, error: unknown) => void,
    httpIssueCallBack?: (url: string) => void
): string {
    // We only proxify URL that are not from our backend.
    if (!LOCAL_OR_INTERNAL_URL_REGEX.test(url)) {
        if (url.startsWith('http:') && httpIssueCallBack) {
            log.warn({
                title: 'kmlUtils / iconUrlProxyFy',
                titleColor: LogPreDefinedColor.Lime,
                messages: [`KML Icon url ${url} has an http scheme`],
            })
            httpIssueCallBack(url)
        }
        const proxyUrl = proxifyUrl(url)
        // Only perform the CORS check if we have a callback and it has not yet been done
        if (!nonGeoadminIconUrls.has(url) && corsIssueCallback) {
            nonGeoadminIconUrls.add(url)
            log.warn({
                title: 'kmlUtils / iconUrlProxyFy',
                titleColor: LogPreDefinedColor.Lime,
                messages: [`Non geoadmin KML Icon url detected, checking CORS: ${url}`],
            })
            // Detected non geoadmin URL, in this case always use the proxy to avoid CORS errors as
            // this method is synchrone.
            // but still check for CORS support asynchronously to set a user warning if needed.
            axios
                .head(url, {
                    timeout: 10 * 1000,
                })
                .then((response) => {
                    log.debug({
                        title: 'kmlUtils / iconUrlProxyFy',
                        titleColor: LogPreDefinedColor.Lime,
                        messages: [`KML Icon url ${url} support CORS:`, response],
                    })
                })
                .catch((error) => {
                    log.warn({
                        title: 'kmlUtils / iconUrlProxyFy',
                        titleColor: LogPreDefinedColor.Lime,
                        messages: [`KML Icon url ${url} do not support CORS`, error],
                    })
                    if (corsIssueCallback) {
                        corsIssueCallback(url, error)
                    }
                })
        }

        log.debug({
            title: 'kmlUtils / iconUrlProxyFy',
            titleColor: LogPreDefinedColor.Lime,
            messages: [`KML icon change url from ${url} to ${proxyUrl}`],
        })
        return proxyUrl
    }
    return url
}

function handleIconUrl(
    url: string,
    iconUrlProxy: (url: string) => string = iconUrlProxyFy,
    files: Record<string, BlobPart> = {}
) {
    // Check if the url is relative to the web application
    // To do this we take the location origin with the path, making sure that the path is the folder
    // and not a file.
    const localPrefix = `${location.origin}${location.pathname.replace(/[^/]+$/, '')}`
    if (url.startsWith(localPrefix)) {
        // url is relative file, try to get it from the kml link files
        const file = files[url.replace(localPrefix, '')]
        if (file) {
            return URL.createObjectURL(new Blob([file]))
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
 * @param kmlLayer KML layer to parse
 * @param projection Projection to use for the OL Feature
 * @param resolution Resolution of the map, in meters per pixel
 * @param iconSets Icon sets to use for EditabeFeature deserialization
 * @param iconUrlProxy Function to use to proxyify the icon url
 * @returns List of OL Features
 */
export function parseKml(
    kmlLayer: KMLLayer,
    projection: CoordinateSystem,
    iconSets: DrawingIconSet[],
    resolution: number,
    iconUrlProxy: (url: string) => string = iconUrlProxyFy
): Feature<Geometry>[] {
    const kmlData = kmlLayer.kmlData
    const files = kmlLayer.internalFiles

    const features = new KML({
        iconUrlFunction: (url: string) => handleIconUrl(url, iconUrlProxy, files),
    }).readFeatures(kmlData, {
        dataProjection: WGS84.epsg, // KML files should always be in WGS84
        featureProjection: projection.epsg,
    })

    if (kmlLayer.style === KMLStyle.GEOADMIN) {
        features.forEach((olFeature) => {
            const editableFeature = getEditableFeatureFromKmlFeature(
                olFeature,
                iconSets,
                resolution
            )
            if (editableFeature) {
                // Set the EditableFeature coordinates from the olFeature geometry
                editableFeature.coordinates = extractOlFeatureCoordinates(olFeature)
                olFeature.set('editableFeature', editableFeature)
            }
            olFeature.setStyle(geoadminStyleFunction)
        })
    }

    return features
}

/**
 * Check if the KML features are valid
 *
 * @param kmlData KML data
 * @returns Returns true if the KML data is valid, false otherwise
 */
export function isKmlFeaturesValid(kmlData: string): boolean {
    try {
        const kmlDom = new DOMParser().parseFromString(kmlData, 'text/xml')
        const kmlGeoJson = kmlToGeoJSON(kmlDom)

        const invalidFeatures = kmlGeoJson.features.filter((feature) => !booleanValid(feature))
        const errorsCount = invalidFeatures.length
        if (errorsCount > 0) {
            log.warn({
                title: 'kmlUtils / isKmlFeaturesValid',
                titleColor: LogPreDefinedColor.Lime,
                messages: [
                    `KML file contains ${errorsCount} invalid feature(s)`,
                    '\ninvalid features:',
                    invalidFeatures,
                ],
            })
            return false
        }

        return true
    } catch (error) {
        if (error instanceof Error) {
            log.error({
                title: 'kmlUtils / isKmlFeaturesValid',
                titleColor: LogPreDefinedColor.Lime,
                messages: ['Failed to parse or validate KML file:', error],
            })
        }
        return false
    }
}

/** Interface representing an unzipped KMZ Object that wraps the content of a KMZ archive */
export interface KMZObject {
    /** Name of the KMZ archive */
    name?: string
    /** Content of the KML file within the KMZ archive (unzipped) */
    kml?: ArrayBuffer
    /** A Map of files with their absolute path as key and their unzipped content as ArrayBuffer */
    files: Map<string, ArrayBuffer>
}

/**
 * Unzipped a KMZ archive following the KMZ google specification.
 *
 * See https://developers.google.com/kml/documentation/kmzarchives
 *
 * @param kmzContent KMZ archive content
 * @param kmzFileName KMZ archive name
 * @returns Returns a KMZ unzip object
 */
export async function unzipKmz(kmzContent: ArrayBuffer, kmzFileName: string): Promise<KMZObject> {
    const kmz: KMZObject = { name: kmzFileName, files: new Map<string, ArrayBuffer>() }
    const zip = new JSZip()
    try {
        await zip.loadAsync(kmzContent)
    } catch (error) {
        if (error instanceof Error) {
            log.error({
                title: 'kmlUtils / unzipKmz',
                titleColor: LogPreDefinedColor.Lime,
                messages: [`Failed to unzip KMZ file ${kmzFileName}:`, error],
            })
        }
        throw new Error(`Failed to unzip KMZ file ${kmzFileName}`, {
            cause: error,
        })
    }

    try {
        // Valid KMZ archive must have 1 KML file with .kml extension
        const allFiles = zip.file(/^.*\.kml$/)
        if (allFiles.length > 0) {
            kmz.kml = await allFiles[0]!.async('arraybuffer')
        }
    } catch (error) {
        if (error instanceof Error) {
            log.error({
                title: 'kmlUtils / unzipKmz',
                titleColor: LogPreDefinedColor.Lime,
                messages: [`Failed to get KML file from KMZ archive ${kmzFileName}:`, error],
            })
        }
        throw new Error(`Failed to get KML file from KMZ archive ${kmzFileName}`, {
            cause: error,
        })
    }

    // Get all other files from the archive
    const files = zip.file(/^(?!.*\.kml$).*$/)
    for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (!file) {
            continue
        }
        try {
            kmz.files.set(file.name, await file.async('arraybuffer'))
        } catch (error) {
            if (error instanceof Error) {
                log.error({
                    title: 'kmlUtils / unzipKmz',
                    titleColor: LogPreDefinedColor.Lime,
                    messages: [
                        `Failed to extract file ${file.name} from KMZ archive ${kmzFileName}. File is ignored.`,
                        error,
                    ],
                })
            }
        }
    }

    return kmz
}

/** Checks if file is KMLs */
export function isKml(fileContent: ArrayBuffer | string): boolean {
    let stringValue: string
    if (typeof fileContent === 'string') {
        stringValue = fileContent
    } else {
        stringValue = new TextDecoder('utf-8').decode(fileContent)
    }
    return /^\s*(<\?xml\b[^>]*\?>)?\s*(<!--(.*?)-->\s*)*<(kml:)?kml\b[^>]*>[\s\S.]*<\/(kml:)?kml\s*>/g.test(
        stringValue
    )
}
