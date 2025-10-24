import type { CoordinateSystem, FlatExtent, SingleCoordinate } from '@swissgeo/coordinates'

import type { BoundingBox, ExternalLayer } from '@/types/layers'

// @microsoft/api-extractor struggles to export only types from a file, so we need to export a dummy variable to make it happy
export const _WHY_NOT: string = 'just so that it is not only type exports...'

// All types necessary to parse WMS and WMTS getCapabilities endpoints

// #region: WMS Capabilities
// region: WMS Capabilities
export interface WMSBoundingBox {
    crs: string
    extent: [number, number, number, number]
    res: [number | null, number | null]
}

export interface WMSLegendURL {
    Format: string
    size: [number, number]
    OnlineResource: string
}

export interface WMSCapabilityLayerStyle {
    LegendURL: WMSLegendURL[]
    Identifier: string
    isDefault: boolean
}
export interface WMSCapabilityLayerDimension {
    name: string
    default: string
    values: string
    current?: boolean
}

export interface WMSCapabilityLayer {
    Dimension?: WMSCapabilityLayerDimension[]
    Name: string
    parent: WMSCapabilityLayer
    Title: string
    Layer?: WMSCapabilityLayer[]
    CRS: string[]
    Abstract: string
    queryable: boolean
    WGS84BoundingBox?: { crs: string; dimensions: unknown }[]
    BoundingBox?: WMSBoundingBox[]
    EX_GeographicBoundingBox: [number, number, number, number]
    Attribution: {
        LogoUrl: {
            Format: string
            OnlineResource: string
            size: [number, number]
        }
        OnlineResource: string
        Title: string
    }
    Style: WMSCapabilityLayerStyle[]
}

export interface WMSDCPType {
    HTTP: {
        Get?: {
            OnlineResource: string
        }
        Post?: {
            OnlineResource: string
        }
    }
}

export interface WMSRequestDescription {
    DCPType: WMSDCPType[]
    Format: string[]
}

/**
 * GetMap and GetCapabilities are mandatory according to WMS OGC specification, GetFeatureInfo is
 * optional
 */
export interface WMSRequestCapabilities {
    GetCapabilities: WMSRequestDescription
    GetMap: WMSRequestDescription
    GetFeatureInfo?: WMSRequestDescription
    GetLegendGraphic?: WMSRequestDescription
}

export interface WMSCapability {
    Layer?: WMSCapabilityLayer
    TileMatrixSet: Array<{
        BoundingBox: BoundingBox[]
        Identifier: string
        SupportedCRS?: string
        TileMatrix: object[]
    }>
    Request: WMSRequestCapabilities
    UserDefinedSymbolization?: {
        SupportSLD: boolean
    }
}

export interface WMSCapabilitiesResponse {
    originUrl: URL
    version: string
    Capability?: WMSCapability
    ServiceProvider?: {
        ProviderName?: string
        ProviderSite?: string
    }
    OperationsMetadata?: Record<string, unknown>
    Service: {
        Title: string
        OnlineResource: string
        MaxWidth?: number
        MaxHeight?: number
    }
}
// endregion
// #endregion

// #region WMTS Capabilities
// region WMTS Capabilities

export interface WMTSBoundingBox {
    lowerCorner?: SingleCoordinate
    upperCorner?: SingleCoordinate
    extent?: FlatExtent
    crs?: string
    dimensions?: number
}

export interface WMTSLegendURL {
    format: string
    width: number
    height: number
    href: string
}

export interface WMTSCapabilityLayerStyle {
    LegendURL: WMTSLegendURL[]
    Identifier: string
    isDefault: boolean
}

export interface WMTSCapabilityLayerDimension {
    Identifier: string
    Default: string
    Value: string
}

export interface WMTSCapabilityResourceURL {
    format: string
    template: string
    resourceType: string
}

export interface WMTSCapabilityLayer {
    Dimension?: WMTSCapabilityLayerDimension[]
    ResourceURL: WMTSCapabilityResourceURL[]
    Identifier: string
    Title: string
    WGS84BoundingBox?: FlatExtent
    BoundingBox?: WMTSBoundingBox[]
    TileMatrixSetLink: WMTSTileMatrixSetLink[]
    Style: WMTSCapabilityLayerStyle[]
    Abstract: string
}

export interface WMTSTileMatrixSetLink {
    TileMatrixSet: string
    TileMatrixSetLimits: Array<{
        MaxTileCol: number
        MaxTileRow: number
        MinTileCol: number
        MinTileRow: number
        TileMatrix: string
    }>
}

export interface WMTSCapabilitiesTileMatrixSet {
    BoundingBox: BoundingBox[]
    Identifier: string
    SupportedCRS?: string
    TileMatrix: object[]
}

export interface WMTSOnlineResourceConstraint {
    AllowedValues: {
        Value: string[]
    }
}

export interface WMTSOnlineResource {
    href: string
    Constraint?: WMTSOnlineResourceConstraint[]
}

export interface OperationMetadata {
    DCP: {
        HTTP: {
            Get?: WMTSOnlineResource[]
            Post?: WMTSOnlineResource[]
        }
    }
}

export interface WMTSCapabilitiesResponse {
    originUrl: URL
    version: string
    Contents?: {
        Layer?: WMTSCapabilityLayer[]
        TileMatrixSet: WMTSCapabilitiesTileMatrixSet[]
    }
    ServiceProvider?: {
        ProviderName?: string
        ProviderSite?: string
    }
    OperationsMetadata?: Record<string, OperationMetadata>
    ServiceIdentification?: {
        ServiceTypeVersion: string
        ServiceType?: string
        Title?: string
        Abstract?: string
    }
}
// endregion
// #endregion

export interface ExternalLayerParsingOptions<ExternalLayerType> {
    /**
     * Tells which coordinate system / projection should be used to describe all geographical values
     * in the parsed external layer (i.e., extent)
     */
    outputProjection?: CoordinateSystem
    /** If true, won't throw exceptions in case of error but return a default value or undefined */
    ignoreErrors?: boolean
    /**
     * Sets of values to assign to the resulting external layer(s). This can be used to set a
     * layer's visibility or opacity after parsing, without using its default values
     */
    initialValues?: Partial<ExternalLayerType>
}

export interface CapabilitiesParser<
    CapabilitiesResponseType extends WMSCapabilitiesResponse | WMTSCapabilitiesResponse,
    CapabilitiesLayerType extends WMSCapabilityLayer | WMTSCapabilityLayer,
    ExternalLayerType extends ExternalLayer,
> {
    /**
     * Parse all capabilities (layers, services, etc...) from this server.
     *
     * @param content XML describing this server (either WMS or WMTS getCapabilities response)
     * @param originUrl URL used to gather the getCapabilities XML response, will be used to set the
     *   attribution for layers, if the server lacks any self-described attribution in its response
     */
    parse(content: string, originUrl?: URL): CapabilitiesResponseType

    /** @param capabilities Object parsed previously by the function {@link #parse} from this parser */
    getAllCapabilitiesLayers(capabilities: CapabilitiesResponseType): CapabilitiesLayerType[]

    /**
     * @param capabilities Object parsed previously by the function {@link #parse} from this parser
     * @param layerId Identifier for the layer we are looking for
     */
    getCapabilitiesLayer(
        capabilities: CapabilitiesResponseType,
        layerId: string
    ): CapabilitiesLayerType | undefined
    getAllExternalLayers(
        capabilities: CapabilitiesResponseType,
        options?: ExternalLayerParsingOptions<ExternalLayerType>
    ): ExternalLayerType[]
    getExternalLayer(
        capabilities: CapabilitiesResponseType,
        layerOrLayerId: CapabilitiesLayerType | string,
        options?: ExternalLayerParsingOptions<ExternalLayerType>
    ): ExternalLayerType | undefined
}
