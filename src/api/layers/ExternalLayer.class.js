import AbstractLayer from '@/api/layers/AbstractLayer.class'
import { LayerAttribution } from '@/api/layers/AbstractLayer.class'

/**
 * Get the default layer attributions based on URL for an external layer
 *
 * @param {string} baseUrl Get Capabilities base URL
 * @returns {LayerAttribution[]} Default list of layer attributions
 */
export function getDefaultAttribution(baseUrl) {
    return [new LayerAttribution(new URL(baseUrl).hostname)]
}

/**
 * Base for all external layers, defining a flag to differentiate them from GeoAdminLayers
 *
 * @abstract
 */
export default class ExternalLayer extends AbstractLayer {
    /**
     * @param {String} name Name of this layer to be shown to the user
     * @param {LayerTypes} layerType The type of layer in GeoAdmin sense (WMTS, WMS, GeoJson,
     *   etc...)
     * @param {String} externalLayerId Layer ID to use when requesting the tiles on the server
     * @param {String} baseURL Base URL to build the request to the data
     * @param {number} opacity The opacity of this layer, between 0.0 (transparent) and 1.0 (opaque)
     * @param {boolean} visible If the layer should be visible on the map
     * @param {LayerAttribution[] | null} attributions Description of the data owner(s) for this
     *   layer. When `null` is given it uses the default attribution which is based on the hostname
     *   of the GetCapabilities server.
     * @param {String} abstract Abstract of this layer to be shown to the user
     * @param {[[number, number], [number, number]] | null} extent Layer extent
     * @param {boolean} isLoading Set to true if some parts of the layer (e.g. metadata) are still
     *   loading
     */
    constructor(
        name,
        layerType,
        externalLayerId,
        baseURL,
        opacity,
        visible,
        attributions = null,
        abstract = '',
        extent = null,
        isLoading = true
    ) {
        super(
            name,
            layerType,
            opacity,
            visible,
            attributions || getDefaultAttribution(baseURL),
            false,
            true
        )
        this.externalLayerId = externalLayerId
        this.baseURL = baseURL
        this.abstract = abstract
        this.extent = extent
        this.isLoading = isLoading
    }

    getURL() {
        return this.baseURL
    }
}
