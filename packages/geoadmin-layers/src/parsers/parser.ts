import type { CoordinateSystem } from '@geoadmin/coordinates'

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
    CapabilitiesResponseType,
    CapabilitiesLayerType,
    ExternalLayerType,
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
