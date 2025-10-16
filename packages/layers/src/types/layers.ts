import type { FlatExtent, SingleCoordinate } from '@swissgeo/coordinates'
import type { Options } from 'ol/source/WMTS'

import { CoordinateSystem } from '@swissgeo/coordinates'
import { ErrorMessage, WarningMessage } from '@swissgeo/log/Message'

import type { WMSRequestCapabilities } from '@/types/capabilities'
import type { GeoAdminGeoJSONStyleDefinition } from '@/types/geoJsonStyle'
import type { LayerTimeConfig } from '@/types/timeConfig'

export type * from '@/types/geoJsonStyle'

export const DEFAULT_OPACITY = 1.0
export const WMS_SUPPORTED_VERSIONS = ['1.3.0']

export enum LayerType {
    WMTS = 'WMTS',
    WMS = 'WMS',
    GEOJSON = 'GEOJSON',
    AGGREGATE = 'AGGREGATE',
    KML = 'KML',
    GPX = 'GPX',
    VECTOR = 'VECTOR',
    GROUP = 'GROUP',
    COG = 'COG',
}

export interface LayerAttribution {
    name: string
    url?: string
}

export interface LayerLegend {
    url: string
    format: string
    width?: number
    height?: number
}

export interface LayerCustomAttributes {
    /**
     * Selected year of the time-enabled layer. Can be one of the following values:
     *
     * - Undefined := either the layer has no timeConfig or we use the default year defined in
     *   layerConfig.timeBehaviour
     * - 'none': = no year is selected, which means that the layer won't be visible. This happens when
     *   using the TimeSlider where a user can select a year that has no data for this layer.
     * - 'all': = load all years for this layer (for WMS this means that no TIME param is added and
     *   for WMTS we use the geoadmin definition YEAR_TO_DESCRIBE_ALL_OR_CURRENT_DATA as timestamp)
     * - 'current': = load current year, only valid for WMTS layer where 'current' is a valid
     *   timestamp.
     * - YYYY: = any valid year entry for this layer, this will load the data only for this year.
     *
     * Affects only time-enabled layers (including External WMS/WMTS layer with timestamp)
     */
    year?: string | number
    /** Automatic refresh time in milliseconds of the layer. Affects GeoAdminGeoJsonLayer only. */
    updateDelay?: number
    /** Colon-separated list of feature IDs to select.` */
    features?: string
    /** KML style to be applied (in case this layer is a KML layer) */
    style?: KMLStyle
    /** Any unlisted param will go here */
    [key: string]: string | number | boolean | undefined
}

export interface Layer {
    /** A unique identifier for each object of this interface * */
    uuid: string
    /** Name of this layer in the current lang */
    name: string
    /**
     * The unique ID of this layer that will be used in the URL to identify it (and also in
     * subsequent backend services for GeoAdmin layers)
     */
    readonly id: string
    /** The layer type */
    readonly type: LayerType
    /**
     * What's the backend base URL to use when requesting tiles/image for this layer, will be used
     * to construct the URL of this layer later on
     */
    baseUrl: string
    /**
     * Flag telling if the base URL must always have a trailing slash. It might be sometime the case
     * that this is unwanted (i.e. for an external WMS URL already built past the point of URL
     * params, a trailing slash would render this URL invalid). Default is `false`
     */
    // readonly ensureTrailingSlashInBaseUrl: boolean
    /** Value from 0.0 to 1.0 telling with which opacity this layer should be shown on the map. */
    opacity: number
    /** If the layer should be visible on the map or hidden. */
    isVisible: boolean
    /** Description of the data owner(s) for this layer. */
    readonly attributions: LayerAttribution[]
    /** Define if this layer shows tooltip when clicked on. */
    readonly hasTooltip: boolean
    /** Define if this layer has a description that can be shown to users to explain its content. */
    readonly hasDescription: boolean
    /** Define if this layer has a legend that can be shown to users to explain its content. */
    readonly hasLegend: boolean
    /** Define if this layer comes from our backend, or is from another (external) source. */
    readonly isExternal: boolean
    /** Set to true if some parts of the layer (e.g. metadata) are still loading */
    isLoading: boolean
    /** Time series config */
    timeConfig: LayerTimeConfig
    /**
     * The custom attributes (except the well known updateDelays, adminId, features and year) passed
     * with the layer id in url.
     */
    customAttributes?: LayerCustomAttributes

    /** List of error linked to this layer (i.e. network error, unparsable data, etc...) */
    errorMessages?: ErrorMessage[]
    /** List of warning linked to this layer (i.e. malformed (but usable) data, etc...) */
    warningMessages?: WarningMessage[]
    hasError: boolean
    hasWarning: boolean
    extent?: FlatExtent
}

// #region: GeoAdminLayers
/** This interface unifies the shared properties of the layers that speak to an API like WMS and WMTS */
export interface GeoAdminLayer extends Layer {
    /**
     * If this layer should be treated as a background layer. Is not read-only because we change the
     * SWISSIMAGE layer on the fly so that it is available as a background layer in 3D (little
     * "hack").
     */
    isBackground: boolean
    /**
     * Tells if this layer possess features that should be highlighted on the map after a click (and
     * if the backend will provide valuable information on the
     * {@link http://api3.geo.admin.ch/services/sdiservices.html#identify-features} endpoint).
     */
    readonly isHighlightable: boolean
    /** All the topics in which belongs this layer. */
    readonly topics: string[]
    /** Define if this layer's features can be searched through the search bar. */
    readonly searchable: boolean
    /**
     * The ID/name to use when requesting the WMS backend, this might be different than id, and many
     * layers (with different id) can in fact request the same layer, through the same technical
     * name, in the end)
     */
    readonly technicalName?: string
    /**
     * The layer ID to be used as a substitute for this layer when we are showing the 3D map. Will
     * be using the same layer if this is set to null. Same as `isBackground`, we set it as writable
     * because we force the layer SWISSIMAGE to be treated as a background layer in 3D.
     */
    idIn3d?: string
    readonly isSpecificFor3d: boolean
    /* oh OK this is determined by the _3d suffix. Why then isn't it made a 3d layer? */
}

/** Represent a WMS Layer from geo.admin.ch */
export interface GeoAdminWMSLayer extends GeoAdminLayer {
    /**
     * How much of a gutter (extra pixels around the image) we want. This is specific for tiled WMS,
     * if unset this layer will be a considered a single tile WMS.
     */
    readonly gutter: number
    /** Version of the WMS protocol to use while requesting images on this layer. */
    readonly wmsVersion: string
    /**
     * The lang ISO code to use when requesting the backend (WMS images can have text that are
     * language dependent).
     */
    readonly lang: string
    /** In which image format the backend must be requested. */
    readonly format: 'png' | 'jpeg'
    readonly type: LayerType.WMS
}

/** Represent a WMTS layer from geo.admin.ch */
export interface GeoAdminWMTSLayer extends GeoAdminLayer {
    /** Define the maximum resolution the layer can reach */
    readonly maxResolution: number
    /** In which image format the backend must be requested. */
    readonly format: 'png' | 'jpeg'
    readonly type: LayerType.WMTS
}

export interface GeoAdmin3DLayer extends GeoAdminLayer {
    readonly type: LayerType.VECTOR
    readonly technicalName: string
    /* If the JSON file stored in the /3d-tiles/ sub-folder on the S3 bucket */
    readonly use3dTileSubFolder: boolean
    /* If this layers' JSON is stored in a
       dedicated timed folder, it can be described with this property. This will be added at the
       end of the URL, before the /tileset.json (or /style.json, depending on the layer type) */
    readonly urlTimestampToUse?: string
}

export interface GeoAdminGeoJSONLayer extends GeoAdminLayer {
    readonly type: LayerType.GEOJSON
    /* Delay after which the data of this layer
        should be re-requested (if null is given, no further data reload will be triggered). A good
        example would be layer 'ch.bfe.ladestellen-elektromobilitaet'. Default is `null` */
    updateDelay?: number
    /* The URL to use to request the styling to apply to the data */
    readonly styleUrl: string
    /* The URL to use when requesting the GeoJSON data (the true GeoJSON per se...) */
    readonly geoJsonUrl: string
    geoJsonStyle?: GeoAdminGeoJSONStyleDefinition
    geoJsonData?: string
    readonly technicalName: string
    readonly isExternal: false
}

export interface GeoAdminVectorLayer extends GeoAdminLayer {
    readonly type: LayerType.VECTOR
    readonly technicalName: string
    readonly attributions: LayerAttribution[]
    readonly isBackground: boolean
}

// #endregion

// #region: File Type Layers
export interface CloudOptimizedGeoTIFFLayer extends Layer {
    readonly type: LayerType.COG
    readonly isLocalFile: boolean
    readonly fileSource?: string
    /* Data/content of the COG file, as a string. */
    data?: string | Blob
}

/** Links to service-kml's entries for this KML */
export interface KMLMetadataLinks {
    /** URL link to the KML's metadata (which is used to set the KMLMetadata values up) */
    readonly metadata: string
    /** URL link to the file itself */
    readonly kml: string
}

/**
 * All info from the metadata endpoint of service-kml
 *
 * @see https://github.com/geoadmin/service-kml/blob/56286ea029b1b01054d0d7e1288279acd0aa9b4b/app/routes.py#L80-L83
 */
export interface KMLMetadata {
    /** The file ID to use to access the resource and metadata */
    readonly id: string
    /**
     * The file admin ID to use if the user wants to modify this file later (without changing his
     * previously generated share links)
     */
    readonly adminId?: string
    readonly created: Date
    updated: Date
    /**
     * Author of the KML.
     *
     * Is used to detect if a KML is from the "legacy" viewer (a.k.a. mf-geoadmin3) or was generated
     * with the current version of the code.
     *
     * To be flagged as "current", this value must be exactly "web-mapviewer". Any other value will
     * be considered a legacy KML.
     *
     * This is especially important for icon URLs, as we've changed service-icons' URL scheme while
     * going live with web-mapviewer's project.
     */
    readonly author: string
    /**
     * Version of the KML drawing
     *
     * This is set by the viewer's code to 1.0.0 (backend will default to 0.0.0) here:
     * https://github.com/geoadmin/web-mapviewer/blob/8fa2cf2ad273779265d2dfad91c8c4b96f47b90f/packages/mapviewer/src/api/files.api.js#L125
     */
    readonly authorVersion: string
    /** URL links to this KML's resource */
    readonly links: KMLMetadataLinks
}

export enum KMLStyle {
    DEFAULT = 'DEFAULT',
    GEOADMIN = 'GEOADMIN',
}

export interface KMLLayer extends Layer {
    /* The URL to access the KML data. */
    kmlFileUrl: string
    fileId?: string
    /* The admin id to allow editing. If not set, the user is not allowed to edit the file. */
    adminId?: string
    /* Data/content of the KML file, as a string. */
    kmlData?: string
    /* Metadata of the KML drawing. This object contains all the metadata returned by the backend. */
    kmlMetadata?: KMLMetadata

    /* Flag defining if the KML should be clamped to
       the 3D terrain (only for 3D viewer). If not set, the clamp to ground flag will be set to
       true if the KML is coming from geoadmin (drawing). Some users wanted to have 3D KMLs (fly
       tracks) that were not clamped to the ground (they are providing height values), and others
       wanted to have their flat surface visible on the ground, so that is the way to please both
       crowds. */
    clampToGround: boolean
    style?: KMLStyle
    isExternal: boolean
    isLocalFile: boolean
    attributions: LayerAttribution[]
    /**
     * KMZ icons subfiles. Those files are usually sent with the KML inside a KMZ archive and can be
     * referenced inside the KML (e.g., icon, image, ...), so that they are available "offline"
     */
    internalFiles: Record<string, ArrayBuffer>
    extentProjection?: CoordinateSystem
    /**
     * Map of KML link files. Those files are usually sent with the kml inside a KMZ archive and can
     * be referenced inside the KML (e.g. icon, image, ...). Default is `Map()`
     */
    // actually a Map, but I'm getting a compilation error here
    linkFiles?: Record<string, ArrayBuffer>
}

export interface GPXLink {
    text?: string
    type?: string
}

export interface GPXAuthor {
    name?: string
    email?: string
    link?: GPXLink
}

export interface GPXMetadata {
    name?: string
    desc?: string
    author?: GPXAuthor
    link?: GPXLink
    time?: number
    keywords?: string
    bounds?: FlatExtent
    extensions?: unknown
}

export interface GPXLayer extends Layer {
    /* URL to the GPX file (can also be a local file URI) */
    readonly gpxFileUrl?: string
    /* Data/content of the GPX file, as a string. */
    gpxData?: string
    /* Metadata of the GPX file. This object contains all the metadata found in the file itself within the <metadata> tag. */
    gpxMetadata?: GPXMetadata
}
// #endregion

// #region: external layers
export interface ExternalLayerTimeDimension {
    /* Dimension identifier */
    readonly id: string
    /* Dimension default value */
    readonly defaultValue: string
    /* All dimension values */
    readonly values: string[]
    /* Boolean flag if the dimension support current (see WMTS/WMS OGC spec) */
    current?: boolean
}

export interface TileMatrixSet {
    /* Identifier of the tile matrix set (see WMTS OGC spec) */
    readonly id: string
    /* Coordinate system supported by the Tile Matrix Set */
    projection: CoordinateSystem
    /* TileMatrix from GetCapabilities (see WMTS OGC spec) */
    tileMatrix: unknown // TODO type this properly
}

export interface BoundingBox {
    readonly lowerCorner?: SingleCoordinate
    readonly upperCorner?: SingleCoordinate
    readonly extent?: FlatExtent
    readonly crs?: string
    readonly dimensions?: number
}

export enum WMTSEncodingType {
    KVP = 'KVP',
    REST = 'REST',
}

/* Configuration describing how to request this layer's server to get feature information. */
export interface ExternalLayerGetFeatureInfoCapability {
    readonly baseUrl: string
    readonly method: 'GET' | 'POST'
    readonly formats: string[]
}

export interface ExternalLayer extends Layer {
    readonly abstract?: string
    readonly availableProjections?: CoordinateSystem[]
    readonly getFeatureInfoCapability?: ExternalLayerGetFeatureInfoCapability
    readonly dimensions: ExternalLayerTimeDimension[]
    /* Current year of the time series config to use. This parameter is needed as it is set in the
       URL while the timeConfig parameter is not yet available and parse later on from the
       GetCapabilities. */
    currentYear?: number
    /* Layer legends. */
    readonly legends?: LayerLegend[]
}

export interface ExternalWMTSLayer extends ExternalLayer {
    /* WMTS Get Capabilities options */
    readonly options?: Partial<Options>
    /* WMTS Get Tile encoding (KVP or REST). */
    readonly getTileEncoding: WMTSEncodingType
    /* WMTS Get Tile url template for REST encoding. */
    readonly urlTemplate: string
    /* WMTS layer style. If no style is given here, and no style is found in the options, the 'default' style will be used. */
    readonly style?: string
    /* WMTS tile matrix sets */
    readonly tileMatrixSets?: TileMatrixSet[]
    readonly type: LayerType.WMTS
}

export interface ExternalWMSLayer extends ExternalLayer {
    /* Description of the layers being part of this WMS layer (they will all be displayed at the
       same time, in contrast to an aggregate layer) */
    readonly layers?: ExternalWMSLayer[]
    /* WMS protocol version to be used when querying this server.  */
    readonly wmsVersion: string
    readonly wmsOperations: WMSRequestCapabilities
    readonly format: 'png' | 'jpeg'
    /** URL parameters to pass to each WMS requests to the server */
    readonly params?: Record<string, string>
}

// #endregion

// #region Combined layers

export interface AggregateSubLayer {
    /* The ID used in the GeoAdmin's backend to describe this sub-layer */
    readonly subLayerId?: string
    /* The sub-layer config (can be a {@link GeoAdminGeoJsonLayer}, a  {@link GeoAdminWMTSLayer} or a {@link GeoAdminWMTSLayer}) */
    readonly layer: GeoAdminLayer
    /* In meter/px, at which resolution this sub-layer should start to  be visible */
    readonly minResolution: number
    /* In meter/px, from which resolution the layer should be hidden */
    readonly maxResolution: number
}

export interface GeoAdminAggregateLayer extends GeoAdminLayer {
    readonly type: LayerType.AGGREGATE
    readonly baseUrl: ''
    readonly subLayers: AggregateSubLayer[]
}

export interface GeoAdminGroupOfLayers extends GeoAdminLayer {
    /* Description of the layers being part of this group */
    readonly layers: GeoAdminLayer[]
    readonly type: LayerType.GROUP
}

// #endregion

export type FileLayer = KMLLayer | GPXLayer | CloudOptimizedGeoTIFFLayer
