import AbstractLayer from '@/api/layers/AbstractLayer.class'

/**
 * Base for all external layers, defining a flag to diferentiate them from GeoAdminLayers
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
     * @param {LayerAttribution[]} attributions Description of the data owner(s) for this layer
     * @param {String} abstract Abstract of this layer to be shown to the user
     * @param {[[number, number], [number, number]] | undefined} extent Layer extent
     */
    constructor(
        name,
        layerType,
        externalLayerId,
        baseURL,
        opacity,
        visible,
        attributions = [],
        abstract = '',
        extent = undefined
    ) {
        super(name, layerType, opacity, visible, attributions, false, true)
        this.externalLayerId = externalLayerId
        this.baseURL = baseURL
        this.abstract = abstract
        this.extent = extent
    }

    getURL() {
        return this.baseURL
    }
}
