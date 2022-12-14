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
     * @param {number} opacity The opacity of this layer, between 0.0 (transparent) and 1.0 (opaque)
     * @param {boolean} visible If the layer should be visible on the map
     * @param {String} attributionName Name to show the user so that he may know who's the data
     *   holder (it typically is the hostname of the server for this layer)
     */
    constructor(name, layerType, opacity, visible, attributionName) {
        super(name, layerType, opacity, visible)
        this.isExternal = true
        this.attributionName = attributionName
    }
}
