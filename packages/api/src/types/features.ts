import type { CoordinateSystem, FlatExtent, SingleCoordinate } from '@swissgeo/coordinates'
import type { Layer } from '@swissgeo/layers'
import type { Geometry } from 'geojson'

import type { DrawingIcon } from '@/types/icons'

/** A color that can be used to style a feature (comprised of a fill and a border color) */
export interface FeatureStyleColor {
    /** Name of the color in english lower cased */
    name: string
    /** HTML color (with # prefix) describing this color (usable in CSS or other styling context) */
    fill: string
    /**
     * HTML color (with # prefix) describing the border color (usable in CSS or other styling
     * context)
     */
    border: string
}

/**
 * Representation of a size for feature style
 *
 * Scale values (that are to apply to the KML/GeoJSON) are different for text and icon. For icon the
 * scale is the one used by open layer and is scaled up by the factor icon_size/32, see
 * https://github.com/openlayers/openlayers/issues/12670
 */
export interface FeatureStyleSize {
    /**
     * Translation key for this size (must go through the i18n service to have a human-readable
     * value)
     */
    label: string
    /** Scale to apply to a text when choosing this size (related to KML/GeoJSON styling) */
    textScale: number
    /** Scale to apply to an icon when choosing this size (related to KML/GeoJSON styling) */
    iconScale: number
}

export type TextPlacement =
    | 'top-left'
    | 'top'
    | 'top-right'
    | 'left'
    | 'center'
    | 'right'
    | 'bottom-left'
    | 'bottom'
    | 'bottom-right'
    | 'unknown'

export interface SelectableFeature<IsEditable extends boolean> {
    /**
     * Unique identifier for this feature (unique in the context it comes from, not for the whole
     * app)
     */
    readonly id: string | number
    /** Coordinates describing the center of this feature. Format is [[x,y],[x2,y2],...] */
    coordinates: SingleCoordinate[] | SingleCoordinate
    /** Title of this feature */
    title: string
    /** A description of this feature. Cannot be HTML content (only text). */
    description?: string
    /** The extent of this feature (if any) expressed as [minX, minY, maxX, maxY]. */
    extent?: FlatExtent
    /** GeoJSON representation of this feature (if it has a geometry, for points it isn't necessary). */
    geometry?: Geometry
    /** Whether this feature is editable when selected (color, size, etc...). */
    readonly isEditable: IsEditable
}

export type EditableFeatureTypes = 'MARKER' | 'ANNOTATION' | 'LINEPOLYGON' | 'MEASURE'

export interface EditableFeature extends SelectableFeature<true> {
    featureType: EditableFeatureTypes
    textOffset: [number, number]
    textColor?: FeatureStyleColor
    textSize?: FeatureStyleSize
    fillColor?: FeatureStyleColor
    strokeColor?: FeatureStyleColor
    icon?: DrawingIcon
    /** Size of the icon (if defined) that will be covering this feature */
    iconSize?: FeatureStyleSize
    /** Anchor of the text around the feature. Only useful for markers */
    textPlacement: TextPlacement
    showDescriptionOnMap: boolean
}

export interface LayerFeature extends SelectableFeature<false> {
    /** The layer in which this feature belongs */
    readonly layer: Layer
    /** Data for this feature's popup (or tooltip). */
    readonly data?: Record<string, string>
    /** HTML representation of this feature */
    readonly popupData?: string
    /**
     * If sanitization should take place before rendering the popup (as HTML) or not (trusted
     * source)
     *
     * We can't trust the content of the popup data for external layers, and for KML layers. For
     * KML, the issue is that users can create text-rich (HTML) description with links, and such. It
     * would then be possible to do some XSS through this, so we need to sanitize this before
     * showing it.
     */
    readonly popupDataCanBeTrusted: boolean
}

export type StoreFeature = EditableFeature | LayerFeature

export interface IdentifyConfig {
    layer: Layer
    /** Coordinate where to identify */
    coordinate: SingleCoordinate | FlatExtent
    /** Current map resolution, in meters/pixel */
    resolution: number
    mapExtent: FlatExtent
    screenWidth: number
    screenHeight: number
    lang: string
    projection: CoordinateSystem
    featureCount: number
    tolerance?: number
    /**
     * Offset of how many items the identification should start after. This enables us to do some
     * "pagination" or "load more" (if you already have 10 features, set an offset of 10 to get the
     * 10 next, 20 in total). This only works with GeoAdmin backends
     */
    offset?: number
    /**
     * The wanted output projection. Enable us to request this WMS with a different projection and
     * then reproject on the fly if this WMS doesn't support the current map projection.
     */
    outputProjection?: CoordinateSystem
}

interface IdentifyResultProperties {
    x: number
    y: number
    lat: number
    lon: number
    label: string
    [key: string]: number | string | null
}

export interface IdentifyResult {
    featureId: string
    bbox: FlatExtent
    layerBodId: string
    layerName: string
    id: string
    geometry: Geometry
    properties: IdentifyResultProperties
}

export interface IdentifyResponse {
    results: IdentifyResult[]
}

export interface GetFeatureOptions {
    /** The language for the HTML popup. Will default to `en` if none given. */
    lang?: string
    /** Width of the screen in pixels */
    screenWidth?: number
    /** Height of the screen in pixels */
    screenHeight?: number
    /** Current extent of the map, described in LV95. */
    mapExtent?: FlatExtent
    coordinate?: SingleCoordinate | FlatExtent
}

export const StyleZIndex = {
    AzimuthCircle: 0,
    MainStyle: 10,
    Line: 20,
    MeasurePoint: 21,
    WhiteDot: 30,
    Tooltip: 40,
    OnTop: 9999,
}
