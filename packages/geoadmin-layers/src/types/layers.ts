import type { Options } from 'ol/source/WMTS'

import { CoordinateSystem } from '@geoadmin/coordinates'
import { ErrorMessage, WarningMessage } from '@geoadmin/log/Message'

import type { LayerTimeConfig } from '@/types/timeConfig'

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

/** @interface Layer */
export interface Layer {
    /** an unique identifier for each object of this interface **/
    uuid: string,
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
    readonly baseUrl: string
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
    hasDescription: boolean
    /** Define if this layer has a legend that can be shown to users to explain its content. */
    readonly hasLegend: boolean
    /** Define if this layer comes from our backend, or is from another (external) source. */
    readonly isExternal: boolean
    /** Set to true if some parts of the layer (e.g. metadata) are still loading */
    isLoading: boolean
    /** Time series config */
    timeConfig: LayerTimeConfig | null
    /**
     * The custom attributes (except the well known updateDelays, adminId, features and year) passed
     * with the layer id in url.
     */
    customAttributes?: Record<string, string>

    // new fields that weren't specified in AbstractLayer's Constructor
    errorMessages?: Set<ErrorMessage>
    warningMessages?: Set<WarningMessage>
    hasError: boolean
    hasWarning: boolean

    /* The admin id to allow editing. If null then the user is not allowed to edit the file. */
    adminId?: string
}

// #region: GeoAdminLayers
/**
 * This interface unifies the shared properties of the layers that speak to an API like WMS and WMTS
 *
 * @interface GeoAdminLayer
 */
export interface GeoAdminLayer extends Layer {
    /**
     * Tells if this layer possess features that should be highlighted on the map after a click (and
     * if the backend will provide valuable information on the
     * {@link http://api3.geo.admin.ch/services/sdiservices.html#identify-features} endpoint).
     */
    isHighlightable: boolean
    /** All the topics in which belongs this layer. */
    topics: string[]
    /** Define if this layer's features can be searched through the search bar. */
    searchable: boolean
    /**
     * The ID/name to use when requesting the WMS backend, this might be different than id, and many
     * layers (with different id) can in fact request the same layer, through the same technical
     * name, in the end)
     */
    technicalName?: string
    /**
     * The layer ID to be used as substitute for this layer when we are showing the 3D map. Will be
     * using the same layer if this is set to null.
     */
    idIn3d?: string
    isSpecificFor3d: boolean
    /* oh OK this is determined by the _3d suffix. Why then isn't it made a 3d layer? */
}

/**
 * Represent a WMS Layer from geo.admin.ch
 *
 * @interface GeoAdminWmsLayer
 */
export interface GeoAdminWMSLayer extends GeoAdminLayer {
    /**
     * How much of a gutter (extra pixels around the image) we want. This is specific for tiled WMS,
     * if unset this layer will be a considered a single tile WMS.
     */
    gutter: number
    /** Version of the WMS protocol to use while requesting images on this layer. */
    wmsVersion: string
    /**
     * The lang ISO code to use when requesting the backend (WMS images can have text that are
     * language dependent).
     */
    lang: string
    /** In which image format the backend must be requested. */
    format: 'png' | 'jpeg'
    type: LayerType.WMS
}

/**
 * Represent a WMTS layer from geo.admin.ch
 *
 * @interface GeoAdminWMTSLayer
 */
export interface GeoAdminWMTSLayer extends GeoAdminLayer {
    /** If this layer should be treated as a background layer. */
    isBackground: boolean
    /** Define the maximum resolution the layer can reach */
    maxResolution: number
    /** In which image format the backend must be requested. */
    format: 'png' | 'jpeg'
    type: LayerType.WMTS
}

export interface GeoAdmin3DLayer extends GeoAdminLayer {
    type: LayerType.VECTOR
    technicalName: string
    /* If the JSON file stored in the /3d-tiles/ sub-folder on the S3 bucket */
    use3dTileSubFolder: boolean
    /* If this layers' JSON is stored in a
       dedicated timed folder, it can be described with this property. This will be added at the
       end of the URL, before the /tileset.json (or /style.json, depending on the layer type) */
    urlTimestampToUse: boolean | null
}

export interface GeoAdminGeoJSONLayer extends GeoAdminLayer {
    type: LayerType.GEOJSON
    /* Delay after which the data of this layer
        should be re-requested (if null is given, no further data reload will be triggered). A good
        example would be layer 'ch.bfe.ladestellen-elektromobilitaet'. Default is `null` */
    updateDelay: number | null
    /* The URL to use to request the styling to apply to the data */
    styleUrl: string
    /* The URL to use when requesting the GeoJSON data (the true GeoJSON per se...) */
    geoJsonUrl: string
    geoJsonStyle: {
        type: string
        ranges: number[]
    } | null
    geoJsonData: string | null
    technicalName: string
    isExternal: false
}

export interface GeoAdminVectorLayer extends GeoAdminLayer {
    type: LayerType.VECTOR
    technicalName: string
    attributions: LayerAttribution[]
    isBackground: boolean
}

// #endregion

// #region: File Type Layers
export interface CloudOptimizedGeoTIFFLayer extends Layer {
    type: LayerType.COG
    isLocalFile: boolean
    fileSource: string | null
    /* Data/content of the COG file, as a string. */
    data: string | Blob | null
    /* Which value will be describing the absence of data in this COG. Will be used to create
      transparency whenever this value is present. */
    noDataValue: number | null
    /* The extent of this COG. */
    extent: [number, number, number, number] | null
}

export type KmlMetadata = {
    id: string
    adminId: string | null
    links: [
        {
            metadata: string
            kml: string
        },
    ]
    created: Date
    updated: Date
    author: string
    authorVersion: string
}

export enum KmlStyle {
    DEFAULT = 'DEFAULT',
    GEOADMIN = 'GEOADMIN',
}

export interface KMLLayer extends Layer {
    /* The URL to access the KML data. */
    kmlFileUrl: string
    fileId: string | null
    /* Data/content of the KML file, as a string. */
    kmlData: string | null
    /* Metadata of the KML drawing. This object contains all the metadata returned by the backend. */
    kmlMetadata: KmlMetadata | null

    extent: [number, number, number, number] | null
    /* Flag defining if the KML should be clamped to
       the 3D terrain (only for 3D viewer). If not set, the clamp to ground flag will be set to
       true if the KML is coming from geoadmin (drawing). Some users wanted to have 3D KMLs (fly
       tracks) that were not clamped to the ground (they are providing height values), and others
       wanted to have their flat surface visible on the ground, so that is the way to please both
       crowds. */
    clampToGround: boolean
    style: KmlStyle | null
    isExternal: boolean
    isLocalFile: boolean
    attributions: LayerAttribution[]
    /* Map of KML link files. Those files are usually sent with the kml inside a KMZ archive and can
       be referenced inside the KML (e.g. icon, image, ...). */
    linkFiles: Map<String, ArrayBuffer>
}

export type GPXLink = {
    text?: string | undefined
    type?: string | undefined
}

export type GPXAuthor = {
    name?: string | undefined
    email?: string | undefined
    link?: GPXLink | undefined
}

export type GPXMetadata = {
    name?: string | undefined
    desc?: string | undefined
    author?: GPXAuthor | undefined
    link?: GPXLink | undefined
    time?: number | undefined
    keywords?: string | undefined
    bounds?: number[] | undefined
    extensions?: any
}

export interface GPXLayer extends Layer {
    /* URL to the GPX file (can also be a local file URI) */
    gpxFileUrl: string | null
    /* Data/content of the GPX file, as a string. */
    gpxData: string | null
    /* Metadata of the GPX file. This object contains all the metadata found in the file itself within the <metadata> tag. */
    gpxMetadata: GPXMetadata | null
    extent: [number, number, number, number] | null
}
// #endregion

// #region: external layers
export interface WMTSDimension {
    /* Dimension identifier */
    id: string
    /* Dimension default value */
    default: string
    /* All dimension values */
    values: string[]
    /* Boolean flag if the dimension support current (see WMTS OGC spec) */

    current?: boolean
}

export interface TileMatrixSet {
    /* Identifier of the tile matrix set (see WMTS OGC spec) */
    id: string
    /* Coordinate system supported by the Tile Matrix Set */
    projection: CoordinateSystem
    /* TileMatrix from GetCapabilities (see WMTS OGC spec) */
    tileMatrix: any // TODO type this properly
}

export type BoundingBox = {
    lowerCorner?: [number, number]
    upperCorner?: [number, number]
    extent?: [number, number, number, number]
    crs?: string
    dimensions?: number
}

export type LayerExtent =
    | {
          crs: string
          dimensions: any
      }[][]
    | number[][]
    | BoundingBox[][]
    | undefined

export enum WMTSEncodingType {
    KVP = 'KVP',
    REST = 'REST',
}

export interface ExternalWMTSLayer extends Layer {
    /* Abstract of this layer to be shown to the   user. */
    abstract?: string
    extent?: LayerExtent
    /* Layer legends. */
    legends?: LayerLegend[]
    /* All projection that can be used to request this layer. */
    availableProjections?: CoordinateSystem[]
    /* WMTS Get Capabilities options */
    options?: Options
    /* WMTS Get Tile encoding (KVP or REST). */
    getTileEncoding: WMTSEncodingType
    /* WMTS Get Tile url template for REST encoding. */
    urlTemplate: string
    /* WMTS layer style. If no style is given here, and no style is found in the options, the 'default' style will be used. */
    style?: string
    /* WMTS tile matrix sets */
    tileMatrixSets?: TileMatrixSet[]
    /* WMTS tile dimensions */
    dimensions?: WMTSDimension[]
    /* Current year of the time series config to use. This parameter is needed as it is set in the
       URL while the timeConfig parameter is not yet available and parse later on from the
       GetCapabilities. */
    currentYear?: number
    type: LayerType.WMTS
}

export interface WMSDimension {
    id: string
    dft: string
    values?: string[]
    current?: boolean
}

export interface ExternalWMSLayer extends Layer {
    /* Abstract of this layer to be shown to the user. */
    abstract?: string
    /* WMS Dimensions */
    dimensions: WMSDimension[]
    /*All projection that can   be used to request this layer. */
    availableProjections?: CoordinateSystem[]
    /* Configuration describing how to request this layer's server to get feature information. */
    getFeatureInfoCapability?: any
    /* The custom attributes (except the well known updateDelays, adminId, features and year)
       passed with the layer id in url. */
    customAttributes?: Record<string, any>
    /* Description of the layers being part of this WMS layer (they will all be displayed at the
       same time, in contrast to an aggregate layer) */
    layers?: ExternalWMSLayer[]
    /* WMS protocol version to be used when querying this server.  */
    wmsVersion: string
    format: 'png' | 'jpeg'
    extent?: LayerExtent
    /* Layer legends */
    legends?: LayerLegend[]
    /* Current year of the time series config to use. This parameter is needed as it is set in the
       URL while the timeConfig parameter is not yet available and parse later on from the
       GetCapabilities. */
    currentYear?: number
}

// #endregion

// #region Combined layers

export interface AggregateSubLayer {
    /* The ID used in the GeoAdmin's backend to describe this sub-layer */
    subLayerId: string | null
    /* The sub-layer config (can be a {@link GeoAdminGeoJsonLayer}, a  {@link GeoAdminWMTSLayer} or a {@link GeoAdminWMTSLayer}) */
    layer: GeoAdminLayer,
    /* In meter/px, at which resolution this sub-layer should start to  be visible */
    minResolution: number
    /* In meter/px, from which resolution the layer should be hidden */
    maxResolution: number
}

export interface GeoAdminAggregateLayer extends GeoAdminLayer {
    type: LayerType.AGGREGATE
    baseUrl: ''
    subLayers: AggregateSubLayer[]
}

export interface GeoAdminGroupOfLayers extends Layer {
    /* Description of the layers being part of this group */
    layers: GeoAdminLayer[]
    type: LayerType.GROUP
}

// #endregion

export type FileLayer = KMLLayer | GPXLayer | CloudOptimizedGeoTIFFLayer
export type ExternalLayer = ExternalWMSLayer | ExternalWMTSLayer
