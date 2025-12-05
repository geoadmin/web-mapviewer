import { CapabilitiesParser } from './parser';
import { BoundingBox, ExternalWMSLayer } from '../types/layers';
interface WMSBoundingBox {
    crs: string;
    extent: [number, number, number, number];
    res: [number | null, number | null];
}
interface WMSLegendURL {
    Format: string;
    size: [number, number];
    OnlineResource: string;
}
interface WMSCapabilityLayerStyle {
    LegendURL: WMSLegendURL[];
    Identifier: string;
    isDefault: boolean;
}
interface WMSCapabilityLayerDimension {
    name: string;
    default: string;
    values: string;
    current?: boolean;
}
export interface WMSCapabilityLayer {
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
interface DCPType {
    HTTP: {
        Get?: {
            OnlineResource: string;
        };
        Post?: {
            OnlineResource: string;
        };
    };
}
interface Request {
    DCPType: DCPType[];
    Format: string[];
}
/**
 * GetMap and GetCapabilities are mandatory according to WMS OGC specification, GetFeatureInfo is
 * optional
 */
export interface WMSRequestCapabilities {
    GetCapabilities: Request;
    GetMap: Request;
    GetFeatureInfo?: Request;
    GetLegendGraphic?: Request;
}
interface WMSCapability {
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
export interface WMSCapabilitiesResponse {
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
export type WMSCapabilitiesParser = CapabilitiesParser<WMSCapabilitiesResponse, WMSCapabilityLayer, ExternalWMSLayer>;
export declare const wmsCapabilitiesParser: WMSCapabilitiesParser;
export default wmsCapabilitiesParser;
