import { CoordinateSystem } from '@swissgeo/coordinates';
import { ErrorMessage } from '@swissgeo/log/Message';
import { FlatExtent } from '@swissgeo/coordinates';
import { Interval } from 'luxon';
import { Options } from 'ol/source/WMTS';
import { SingleCoordinate } from '@swissgeo/coordinates';
import { WarningMessage } from '@swissgeo/log/Message';

export declare const addErrorMessageToLayer: (layer: Layer, errorMessage: ErrorMessage) => void;

export declare const addWarningMessageToLayer: (layer: Layer, warningMessage: WarningMessage) => void;

export declare interface AggregateSubLayer {
    readonly subLayerId?: string;
    readonly layer: GeoAdminLayer;
    readonly minResolution: number;
    readonly maxResolution: number;
}

/** Timestamp to describe "all data" for time enabled WMS layer */
export declare const ALL_YEARS_TIMESTAMP: string;

export declare interface BoundingBox {
    readonly lowerCorner?: SingleCoordinate;
    readonly upperCorner?: SingleCoordinate;
    readonly extent?: FlatExtent;
    readonly crs?: string;
    readonly dimensions?: number;
}

/**
 * WMS or WMTS Capabilities Error
 *
 * This class also contains an i18n translation key in plus of a technical english message. The
 * translation key can be used to display a translated user message.
 *
 * @property {string} message Technical english message
 * @property {string} key I18n translation key for user message
 */
export declare class CapabilitiesError extends Error {
    key?: string;
    constructor(message: string, key?: string);
}

export declare const clearErrorMessages: (layer: Layer) => void;

export declare const clearWarningMessages: (layer: Layer) => void;

export declare interface CloudOptimizedGeoTIFFLayer extends Layer {
    readonly type: LayerType.COG;
    readonly isLocalFile: boolean;
    readonly fileSource?: string;
    data?: string | Blob;
    extent?: FlatExtent;
}

/**
 * Timestamp to describe "current" or latest available data for a time enabled WMTS layer (and also
 * is the default value to give any WMTS layer that is not time enabled, as this timestamp is
 * required in the URL scheme)
 */
export declare const CURRENT_YEAR_TIMESTAMP: string;

declare interface DCPType {
    HTTP: {
        Get?: {
            OnlineResource: string;
        };
        Post?: {
            OnlineResource: string;
        };
    };
}

export declare const DEFAULT_OPACITY = 1;

export declare interface ExternalLayer extends Layer {
    readonly abstract?: string;
    readonly availableProjections?: CoordinateSystem[];
    readonly getFeatureInfoCapability?: ExternalLayerGetFeatureInfoCapability;
    readonly dimensions: ExternalLayerTimeDimension[];
    currentYear?: number;
    readonly legends?: LayerLegend[];
    readonly extent?: FlatExtent;
}

export declare interface ExternalLayerGetFeatureInfoCapability {
    readonly baseUrl: string;
    readonly method: 'GET' | 'POST';
    readonly formats: string[];
}

export declare interface ExternalLayerTimeDimension {
    readonly id: string;
    readonly defaultValue: string;
    readonly values: string[];
    current?: boolean;
}

export declare interface ExternalWMSLayer extends ExternalLayer {
    readonly layers?: ExternalWMSLayer[];
    readonly wmsVersion: string;
    readonly wmsOperations: WMSRequestCapabilities;
    readonly format: 'png' | 'jpeg';
    /** URL parameters to pass to each WMS requests to the server */
    readonly params?: Record<string, string>;
}

export declare interface ExternalWMTSLayer extends ExternalLayer {
    readonly options?: Partial<Options>;
    readonly getTileEncoding: WMTSEncodingType;
    readonly urlTemplate: string;
    readonly style?: string;
    readonly tileMatrixSets?: TileMatrixSet[];
    readonly type: LayerType.WMTS;
}

export declare type FileLayer = KMLLayer | GPXLayer | CloudOptimizedGeoTIFFLayer;

export declare interface GeoAdmin3DLayer extends GeoAdminLayer {
    readonly type: LayerType.VECTOR;
    readonly technicalName: string;
    readonly use3dTileSubFolder: boolean;
    readonly urlTimestampToUse?: string;
}

export declare interface GeoAdminAggregateLayer extends GeoAdminLayer {
    readonly type: LayerType.AGGREGATE;
    readonly baseUrl: '';
    readonly subLayers: AggregateSubLayer[];
}

export declare interface GeoAdminGeoJSONLayer extends GeoAdminLayer {
    readonly type: LayerType.GEOJSON;
    updateDelay?: number;
    readonly styleUrl: string;
    readonly geoJsonUrl: string;
    geoJsonStyle?: {
        type: string;
        ranges: number[];
    };
    geoJsonData?: string;
    readonly technicalName: string;
    readonly isExternal: false;
}

export declare interface GeoAdminGroupOfLayers extends Layer {
    readonly layers: (GeoAdminLayer | GeoAdminGroupOfLayers)[];
    readonly type: LayerType.GROUP;
}

/** This interface unifies the shared properties of the layers that speak to an API like WMS and WMTS */
export declare interface GeoAdminLayer extends Layer {
    /** If this layer should be treated as a background layer. */
    readonly isBackground: boolean;
    /**
     * Tells if this layer possess features that should be highlighted on the map after a click (and
     * if the backend will provide valuable information on the
     * {@link http://api3.geo.admin.ch/services/sdiservices.html#identify-features} endpoint).
     */
    readonly isHighlightable: boolean;
    /** All the topics in which belongs this layer. */
    readonly topics: string[];
    /** Define if this layer's features can be searched through the search bar. */
    readonly searchable: boolean;
    /**
     * The ID/name to use when requesting the WMS backend, this might be different than id, and many
     * layers (with different id) can in fact request the same layer, through the same technical
     * name, in the end)
     */
    readonly technicalName?: string;
    /**
     * The layer ID to be used as substitute for this layer when we are showing the 3D map. Will be
     * using the same layer if this is set to null.
     */
    readonly idIn3d?: string;
    readonly isSpecificFor3d: boolean;
}

export declare interface GeoAdminVectorLayer extends GeoAdminLayer {
    readonly type: LayerType.VECTOR;
    readonly technicalName: string;
    readonly attributions: LayerAttribution[];
    readonly isBackground: boolean;
}

/** Represent a WMS Layer from geo.admin.ch */
export declare interface GeoAdminWMSLayer extends GeoAdminLayer {
    /**
     * How much of a gutter (extra pixels around the image) we want. This is specific for tiled WMS,
     * if unset this layer will be a considered a single tile WMS.
     */
    readonly gutter: number;
    /** Version of the WMS protocol to use while requesting images on this layer. */
    readonly wmsVersion: string;
    /**
     * The lang ISO code to use when requesting the backend (WMS images can have text that are
     * language dependent).
     */
    readonly lang: string;
    /** In which image format the backend must be requested. */
    readonly format: 'png' | 'jpeg';
    readonly type: LayerType.WMS;
}

/** Represent a WMTS layer from geo.admin.ch */
export declare interface GeoAdminWMTSLayer extends GeoAdminLayer {
    /** Define the maximum resolution the layer can reach */
    readonly maxResolution: number;
    /** In which image format the backend must be requested. */
    readonly format: 'png' | 'jpeg';
    readonly type: LayerType.WMTS;
}

export declare const getFirstErrorMessage: (layer: Layer) => ErrorMessage | undefined;

export declare const getFirstWarningMessage: (layer: Layer) => WarningMessage | undefined;

export declare interface GPXAuthor {
    name?: string;
    email?: string;
    link?: GPXLink;
}

export declare interface GPXLayer extends Layer {
    readonly gpxFileUrl?: string;
    gpxData?: string;
    gpxMetadata?: GPXMetadata;
    extent?: FlatExtent;
}

export declare interface GPXLink {
    text?: string;
    type?: string;
}

export declare interface GPXMetadata {
    name?: string;
    desc?: string;
    author?: GPXAuthor;
    link?: GPXLink;
    time?: number;
    keywords?: string;
    bounds?: FlatExtent;
    extensions?: unknown;
}

export declare class InvalidLayerDataError extends Error {
    data: unknown;
    constructor(message: string, data: unknown);
}

export declare interface KMLLayer extends Layer {
    kmlFileUrl: string;
    fileId?: string;
    kmlData?: string;
    kmlMetadata?: KMLMetadata;
    extent?: FlatExtent;
    clampToGround: boolean;
    style?: KMLStyle;
    isExternal: boolean;
    isLocalFile: boolean;
    attributions: LayerAttribution[];
    /**
     * KMZ icons subfiles. Those files are usually sent with the KML inside a KMZ archive and can be
     * referenced inside the KML (e.g., icon, image, ...), so that they are available "offline"
     */
    internalFiles: Record<string, ArrayBuffer>;
}

/**
 * All info from the metadata endpoint of service-kml
 *
 * @see https://github.com/geoadmin/service-kml/blob/56286ea029b1b01054d0d7e1288279acd0aa9b4b/app/routes.py#L80-L83
 */
export declare interface KMLMetadata {
    /** The file ID to use to access the resource and metadata */
    readonly id: string;
    /**
     * The file admin ID to use if the user wants to modify this file later (without changing his
     * previously generated share links)
     */
    readonly adminId?: string;
    readonly created: Date;
    updated: Date;
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
    readonly author: string;
    /**
     * Version of the KML drawing
     *
     * This is set by the viewer's code to 1.0.0 (backend will default to 0.0.0) here:
     * https://github.com/geoadmin/web-mapviewer/blob/8fa2cf2ad273779265d2dfad91c8c4b96f47b90f/packages/mapviewer/src/api/files.api.js#L125
     */
    readonly authorVersion: string;
    /** URL links to this KML's resource */
    readonly links: KMLMetadataLinks;
}

/** Links to service-kml's entries for this KML */
export declare interface KMLMetadataLinks {
    /** URL link to the KML's metadata (which is used to set the KMLMetadata values up) */
    readonly metadata: string;
    /** URL link to the file itself */
    readonly kml: string;
}

export declare enum KMLStyle {
    DEFAULT = "DEFAULT",
    GEOADMIN = "GEOADMIN"
}

export declare interface Layer {
    /** A unique identifier for each object of this interface * */
    uuid: string;
    /** Name of this layer in the current lang */
    name: string;
    /**
     * The unique ID of this layer that will be used in the URL to identify it (and also in
     * subsequent backend services for GeoAdmin layers)
     */
    readonly id: string;
    /** The layer type */
    readonly type: LayerType;
    /**
     * What's the backend base URL to use when requesting tiles/image for this layer, will be used
     * to construct the URL of this layer later on
     */
    readonly baseUrl: string;
    /**
     * Flag telling if the base URL must always have a trailing slash. It might be sometime the case
     * that this is unwanted (i.e. for an external WMS URL already built past the point of URL
     * params, a trailing slash would render this URL invalid). Default is `false`
     */
    /** Value from 0.0 to 1.0 telling with which opacity this layer should be shown on the map. */
    opacity: number;
    /** If the layer should be visible on the map or hidden. */
    isVisible: boolean;
    /** Description of the data owner(s) for this layer. */
    readonly attributions: LayerAttribution[];
    /** Define if this layer shows tooltip when clicked on. */
    readonly hasTooltip: boolean;
    /** Define if this layer has a description that can be shown to users to explain its content. */
    readonly hasDescription: boolean;
    /** Define if this layer has a legend that can be shown to users to explain its content. */
    readonly hasLegend: boolean;
    /** Define if this layer comes from our backend, or is from another (external) source. */
    readonly isExternal: boolean;
    /** Set to true if some parts of the layer (e.g. metadata) are still loading */
    isLoading: boolean;
    /** Time series config */
    timeConfig: LayerTimeConfig;
    /**
     * The custom attributes (except the well known updateDelays, adminId, features and year) passed
     * with the layer id in url.
     */
    customAttributes?: LayerCustomAttributes;
    /** List of error linked to this layer (i.e. network error, unparsable data, etc...) */
    errorMessages?: ErrorMessage[];
    /** List of warning linked to this layer (i.e. malformed (but usable) data, etc...) */
    warningMessages?: WarningMessage[];
    hasError: boolean;
    hasWarning: boolean;
    adminId?: string;
}

export declare interface LayerAttribution {
    name: string;
    url?: string;
}

export declare const layerContainsErrorMessage: (layer: Layer, errorMessage: ErrorMessage) => boolean;

export declare const layerContainsWarningMessage: (layer: Layer, warningMessage: WarningMessage) => boolean;

export declare interface LayerCustomAttributes {
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
    year?: string | number;
    /** Automatic refresh time in milliseconds of the layer. Affects GeoAdminGeoJsonLayer only. */
    updateDelay?: number;
    /** Colon-separated list of feature IDs to select.` */
    features?: string;
    /** KML style to be applied (in case this layer is a KML layer) */
    style?: KMLStyle;
    /** Any unlisted param will go here */
    [key: string]: string | number | boolean | undefined;
}

export declare interface LayerLegend {
    url: string;
    format: string;
    width?: number;
    height?: number;
}

export declare interface LayerTimeConfig {
    timeEntries: LayerTimeConfigEntry[];
    /**
     * Describe which time entry should be used as default value if no value is previously defined
     * when loading the layer.
     *
     * - 'last': will use the top entry from the entry list (the last => the most recent, not the last
     *   of the list)
     * - 'all': will stay as "all", as this describes some kind of hack on the backend to show a fake
     *   year that includes all data (there's not yet support for a real "give me all data" time
     *   entry there)
     * - "current": stays as "current", alias value to tell the backend to show the latest available
     *   value, without having to change the URL each year for our users. ("current" will always
     *   display the latest available data when asked on the backend)
     * - Any number value: specific value, that will be set as is.
     */
    behaviour?: 'last' | 'all' | 'current' | number | string;
    currentTimeEntry?: LayerTimeConfigEntry;
}

export declare interface LayerTimeConfigEntry {
    /**
     * The timestamp used by our backend service to describe this entry (should be used in the URL
     * when requesting tiles/images)
     */
    timestamp: string;
    nonTimeBasedValue?: string;
    interval?: Interval;
}

/**
 * Duration of time for when to show data on this layer. Can be a set of instant (expressed as an
 * Interval) or two preset values :
 *
 * - "all": show all available data, across all time entries
 * - "current": show "current" data, which stays "current" when new data is added (loads the new data)
 */
export declare type LayerTimeInterval = Interval | 'all' | 'current';

export declare enum LayerType {
    WMTS = "WMTS",
    WMS = "WMS",
    GEOJSON = "GEOJSON",
    AGGREGATE = "AGGREGATE",
    KML = "KML",
    GPX = "GPX",
    VECTOR = "VECTOR",
    GROUP = "GROUP",
    COG = "COG"
}

export declare const removeErrorMessageFromLayer: (layer: Layer, errorMessage: ErrorMessage) => void;

export declare const removeWarningMessageFromLayer: (layer: Layer, warningMessage: WarningMessage) => void;

declare interface Request_2 {
    DCPType: DCPType[];
    Format: string[];
}

export declare interface TileMatrixSet {
    readonly id: string;
    projection: CoordinateSystem;
    tileMatrix: unknown;
}

/**
 * Validate a component prop for basic layer type
 *
 * In cases where we don't yet use TS in vue components, we can't check the props against the
 * interfaces. It used to be done with a instanceof AbstractLayer check. This function helps solving
 * that issue by checking for the very basic and absolutely necessary properties of a Layer object.
 * This should be good enough in the transition to TS to ensure that the provided property is indeed
 * an implementation of Layer
 *
 * @param value Any Object
 * @returns Boolean
 */
export declare const validateLayerProp: (value: Record<string, unknown>) => boolean;

export declare const WMS_SUPPORTED_VERSIONS: string[];

/**
 * GetMap and GetCapabilities are mandatory according to WMS OGC specification, GetFeatureInfo is
 * optional
 */
declare interface WMSRequestCapabilities {
    GetCapabilities: Request_2;
    GetMap: Request_2;
    GetFeatureInfo?: Request_2;
    GetLegendGraphic?: Request_2;
}

export declare enum WMTSEncodingType {
    KVP = "KVP",
    REST = "REST"
}

/**
 * Year we are using to describe the timestamp "all data" for WMS (and also for WMTS as there is no
 * equivalent for that in the norm)
 *
 * For WMTS : as we want this year to be passed along year by year, we can't use the actual year
 * (today would be 2025) as otherwise this link opened in 2030 won't show "current" data but 2025
 * data, so we store it the same way WMS does, with 9999 as a year
 */
export declare const YEAR_TO_DESCRIBE_ALL_OR_CURRENT_DATA: number;

export { }
