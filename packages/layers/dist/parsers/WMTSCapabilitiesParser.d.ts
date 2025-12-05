import { FlatExtent, SingleCoordinate } from '@swissgeo/coordinates';
import { CapabilitiesParser } from './parser';
import { BoundingBox, ExternalWMTSLayer } from '../types';
interface WMTSBoundingBox {
    lowerCorner?: SingleCoordinate;
    upperCorner?: SingleCoordinate;
    extent?: FlatExtent;
    crs?: string;
    dimensions?: number;
}
interface WMTSLegendURL {
    format: string;
    width: number;
    height: number;
    href: string;
}
interface WMTSCapabilityLayerStyle {
    LegendURL: WMTSLegendURL[];
    Identifier: string;
    isDefault: boolean;
}
interface WMTSCapabilityLayerDimension {
    Identifier: string;
    Default: string;
    Value: string;
}
interface WMTSCapabilityResourceURL {
    format: string;
    template: string;
    resourceType: string;
}
interface WMTSCapabilityLayer {
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
interface WMTSTileMatrixSetLink {
    TileMatrixSet: string;
    TileMatrixSetLimits: Array<{
        MaxTileCol: number;
        MaxTileRow: number;
        MinTileCol: number;
        MinTileRow: number;
        TileMatrix: string;
    }>;
}
interface WMTSCapabilitiesTileMatrixSet {
    BoundingBox: BoundingBox[];
    Identifier: string;
    SupportedCRS?: string;
    TileMatrix: object[];
}
interface OnlineResourceConstraint {
    AllowedValues: {
        Value: string[];
    };
}
interface OnlineResource {
    href: string;
    Constraint?: OnlineResourceConstraint[];
}
interface OperationMetadata {
    DCP: {
        HTTP: {
            Get?: OnlineResource[];
            Post?: OnlineResource[];
        };
    };
}
export interface WMTSCapabilitiesResponse {
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
export type WMTSCapabilitiesParser = CapabilitiesParser<WMTSCapabilitiesResponse, WMTSCapabilityLayer, ExternalWMTSLayer>;
export declare const wmtsCapabilitiesParser: WMTSCapabilitiesParser;
export default wmtsCapabilitiesParser;
