import type { CoordinateSystem, FlatExtent, SingleCoordinate } from '@swissgeo/coordinates'
import type { Layer } from '@swissgeo/layers'
import type { Geometry } from 'geojson'

import type { DrawingIcon } from '@/api/icons/types'
import type { FeatureStyleColor, FeatureStyleSize, TextPlacement } from '@/utils/featureStyle/types'

export interface SelectableFeature {
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
    readonly isEditable: boolean
}

export type EditableFeatureTypes = 'MARKER' | 'ANNOTATION' | 'LINEPOLYGON' | 'MEASURE'

export interface EditableFeature extends SelectableFeature {
    isEditable: true
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

export interface LayerFeature extends SelectableFeature {
    isEditable: false
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
