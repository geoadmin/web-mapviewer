import { ErrorMessage } from '@swissgeo/log/Message';
import { FlatExtent } from '@swissgeo/coordinates';
import { Interval } from 'luxon';
import { SingleCoordinate } from '@swissgeo/coordinates';
import { Staging } from '@swissgeo/staging-config';
import { WarningMessage } from '@swissgeo/log/Message';

declare interface BoundingBox {
    readonly lowerCorner?: SingleCoordinate;
    readonly upperCorner?: SingleCoordinate;
    readonly extent?: FlatExtent;
    readonly crs?: string;
    readonly dimensions?: number;
}

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

/**
 * Decode an external layer parameter.
 *
 * This percent decode the special character | used to separate external layer parameters.
 *
 * NOTE: We don't use decodeURIComponent here because the Vue Router will anyway do the
 * decodeURIComponent() therefore by only decoding | we avoid to decode other special character
 * twice. But we need to decode | twice to avoid layer parsing issue.
 *
 * @param {string} param Parameter to encode
 * @returns {string} Percent encoded parameter
 */
export declare function decodeExternalLayerParam(param: string): string;

/**
 * Encode an external layer parameter.
 *
 * This percent encode the special character | used to separate external layer parameters.
 *
 * NOTE: We don't use encodeURIComponent here because the Vue Router will anyway do the
 * encodeURIComponent() therefore by only encoding | we avoid to encode other special character
 * twice. But we need to encode | twice to avoid layer parsing issue.
 *
 * @param {string} param Parameter to encode
 * @returns {string} Percent encoded parameter
 */
export declare function encodeExternalLayerParam(param: string): string;

/** Timeout for accessing external server in [ms] */
export declare const EXTERNAL_SERVER_TIMEOUT = 30000;

/**
 * Transform the backend metadata JSON object into objects of type {@link GeoAdminLayer}, using the
 * correct specialized type of layer for each entry (see {@link LayerType} and all dedicated
 * specialized types, such as {@link GeoAdminWMSLayer} or {@link GeoAdminWMTSLayer}).
 */
export declare function generateLayerObject(layerConfig: LayerConfigResponse, id: string, allOtherLayers: Record<string, LayerConfigResponse>, lang: string, staging?: Staging): GeoAdminLayer | undefined;

/** This interface unifies the shared properties of the layers that speak to an API like WMS and WMTS */
declare interface GeoAdminLayer extends Layer {
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

/**
 * Loads the legend (HTML content) for this layer ID
 *
 * @param {String} lang The language in which the legend should be rendered
 * @param {String} layerId The unique layer ID used in our backends
 * @param {Staging} staging
 * @returns {Promise<String>} HTML content of the layer's legend
 */
export declare function getGeoadminLayerDescription(lang: string, layerId: string, staging?: Staging): Promise<string>;

declare enum KMLStyle {
    DEFAULT = "DEFAULT",
    GEOADMIN = "GEOADMIN"
}

declare interface Layer {
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

declare interface LayerAttribution {
    name: string;
    url?: string;
}

export declare interface LayerConfigResponse {
    opacity: number;
    type: string;
    background: boolean;
    searchable: boolean;
    tooltip: boolean;
    timeEnabled: boolean;
    highlightable: boolean;
    chargeable: boolean;
    hasLegend: boolean;
    attribution: string;
    attributionUrl?: string;
    config3d?: string;
    topics: string;
    label: string;
    serverLayerName: string;
    timestamps?: string[];
    timeBehaviour?: string;
    singleTile?: boolean;
    wmsUrl?: string;
    wmsLayers?: string;
    gutter?: number;
    format?: 'jpeg' | 'png';
    queryableAttributes?: string[];
    resolutions?: number[];
    geojsonUrl?: string;
    styleUrl?: string;
    updateDelay?: number;
    subLayersIds?: string[];
    minResolution?: number;
    maxResolution?: number;
}

declare interface LayerCustomAttributes {
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

declare interface LayerTimeConfig {
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

declare interface LayerTimeConfigEntry {
    /**
     * The timestamp used by our backend service to describe this entry (should be used in the URL
     * when requesting tiles/images)
     */
    timestamp: string;
    nonTimeBasedValue?: string;
    interval?: Interval;
}

declare enum LayerType {
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

/**
 * Loads the layer config from the backend and transforms it in classes defined in this API file
 *
 * @param {String} lang The ISO code for the lang in which the config should be loaded (required)
 * @param {Staging} staging
 */
export declare function loadGeoadminLayersConfig(lang: string, staging?: Staging): Promise<GeoAdminLayer[]>;

declare interface OnlineResource {
    href: string;
    Constraint?: OnlineResourceConstraint[];
}

declare interface OnlineResourceConstraint {
    AllowedValues: {
        Value: string[];
    };
}

declare interface OperationMetadata {
    DCP: {
        HTTP: {
            Get?: OnlineResource[];
            Post?: OnlineResource[];
        };
    };
}

/**
 * Parse WMS Get Capabilities string
 *
 * @param content Input content to parse
 */
export declare function parseWmsCapabilities(content: string): WMSCapabilitiesResponse;

/**
 * Parse WMTS Get Capabilities string
 *
 * @param content Input content to parse
 * @param originUrl Origin URL of the content, this is used as default GetCapabilities URL if not
 *   found in the Capabilities
 */
export declare function parseWmtsCapabilities(content: string, originUrl: URL): WMTSCapabilitiesResponse;

/**
 * Read and parse WMS GetCapabilities
 *
 * @param baseUrl Base URL for the WMS server
 * @param language Language parameter to use if the server support localization
 */
export declare function readWmsCapabilities(baseUrl: string, language?: string): Promise<WMSCapabilitiesResponse | undefined>;

/** Read and parse WMTS GetCapabilities */
export declare function readWmtsCapabilities(baseUrl: string, language?: string): Promise<WMTSCapabilitiesResponse>;

declare interface Request_2 {
    DCPType: DCPType[];
    Format: string[];
}

/** Sets the WMS GetCapabilities url parameters */
export declare function setWmsGetCapabilitiesParams(url: URL, language?: string): URL;

/** Sets the WMS GetMap url parameters */
export declare function setWmsGetMapParams(url: URL, layer: string, crs: string, style: string): URL;

/** Sets the WMTS GetCapabilities url parameters */
export declare function setWmtsGetCapParams(url: URL, language?: string): URL;

declare interface WMSBoundingBox {
    crs: string;
    extent: [number, number, number, number];
    res: [number | null, number | null];
}

declare interface WMSCapabilitiesResponse {
    originUrl: URL;
    version: string;
    Capability?: WMSCapability;
    ServiceProvider?: {
        ProviderName?: string;
        ProviderSite?: string;
    };
    OperationsMetadata?: Record<string, unknown>;
    Service: {
        Title: string;
        OnlineResource: string;
        MaxWidth?: number;
        MaxHeight?: number;
    };
}

declare interface WMSCapability {
    Layer?: WMSCapabilityLayer;
    TileMatrixSet: Array<{
        BoundingBox: BoundingBox[];
        Identifier: string;
        SupportedCRS?: string;
        TileMatrix: object[];
    }>;
    Request: WMSRequestCapabilities;
    UserDefinedSymbolization?: {
        SupportSLD: boolean;
    };
}

declare interface WMSCapabilityLayer {
    Dimension?: WMSCapabilityLayerDimension[];
    Name: string;
    parent: WMSCapabilityLayer;
    Title: string;
    Layer?: WMSCapabilityLayer[];
    CRS: string[];
    Abstract: string;
    queryable: boolean;
    WGS84BoundingBox?: {
        crs: string;
        dimensions: unknown;
    }[];
    BoundingBox?: WMSBoundingBox[];
    EX_GeographicBoundingBox: [number, number, number, number];
    Attribution: {
        LogoUrl: {
            Format: string;
            OnlineResource: string;
            size: [number, number];
        };
        OnlineResource: string;
        Title: string;
    };
    Style: WMSCapabilityLayerStyle[];
}

declare interface WMSCapabilityLayerDimension {
    name: string;
    default: string;
    values: string;
    current?: boolean;
}

declare interface WMSCapabilityLayerStyle {
    LegendURL: WMSLegendURL[];
    Identifier: string;
    isDefault: boolean;
}

declare interface WMSLegendURL {
    Format: string;
    size: [number, number];
    OnlineResource: string;
}

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

declare interface WMTSBoundingBox {
    lowerCorner?: SingleCoordinate;
    upperCorner?: SingleCoordinate;
    extent?: FlatExtent;
    crs?: string;
    dimensions?: number;
}

declare interface WMTSCapabilitiesResponse {
    originUrl: URL;
    version: string;
    Contents?: {
        Layer?: WMTSCapabilityLayer[];
        TileMatrixSet: WMTSCapabilitiesTileMatrixSet[];
    };
    ServiceProvider?: {
        ProviderName?: string;
        ProviderSite?: string;
    };
    OperationsMetadata?: Record<string, OperationMetadata>;
    ServiceIdentification?: {
        ServiceTypeVersion: string;
        ServiceType?: string;
        Title?: string;
        Abstract?: string;
    };
}

declare interface WMTSCapabilitiesTileMatrixSet {
    BoundingBox: BoundingBox[];
    Identifier: string;
    SupportedCRS?: string;
    TileMatrix: object[];
}

declare interface WMTSCapabilityLayer {
    Dimension?: WMTSCapabilityLayerDimension[];
    ResourceURL: WMTSCapabilityResourceURL[];
    Identifier: string;
    Title: string;
    WGS84BoundingBox?: FlatExtent;
    BoundingBox?: WMTSBoundingBox[];
    TileMatrixSetLink: WMTSTileMatrixSetLink[];
    Style: WMTSCapabilityLayerStyle[];
    Abstract: string;
}

declare interface WMTSCapabilityLayerDimension {
    Identifier: string;
    Default: string;
    Value: string;
}

declare interface WMTSCapabilityLayerStyle {
    LegendURL: WMTSLegendURL[];
    Identifier: string;
    isDefault: boolean;
}

declare interface WMTSCapabilityResourceURL {
    format: string;
    template: string;
    resourceType: string;
}

declare interface WMTSLegendURL {
    format: string;
    width: number;
    height: number;
    href: string;
}

declare interface WMTSTileMatrixSetLink {
    TileMatrixSet: string;
    TileMatrixSetLimits: Array<{
        MaxTileCol: number;
        MaxTileRow: number;
        MinTileCol: number;
        MinTileRow: number;
        TileMatrix: string;
    }>;
}

export { }
