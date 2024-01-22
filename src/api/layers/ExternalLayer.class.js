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
 * External Layer Legend
 *
 * @WARNING DON'T USE GETTER AND SETTER ! Instances of this class will be used a Vue 3 reactive
 * object which SHOULD BE plain javascript object ! For convenience we use class instances but this
 * has some limitations and javascript class getter and setter are not correctly supported which
 * introduced subtle bugs. As rule of thumb we should avoid any public methods with side effects on
 * properties, properties should change be changed either by the constructor or directly by setting
 * them, not through a functions that updates other properties as it can lead to subtle bugs due
 * to Vue reactivity engine.
 */
export class LayerLegend {
    /**
     * @param {String} url Legend URL
     * @param {String} format Legend MIME type
     * @param {number | null} width Width of the legend image (in case the format is an image
     *   format)
     * @param {number | null} height Height of the legend image (in case the format is an image
     *   format)
     */
    constructor(url, format, width = null, height = null) {
        this.url = url
        this.format = format
        this.width = width
        this.height = height
    }
}

/**
 * Base for all external layers, defining a flag to differentiate them from GeoAdminLayers
 *
 * @abstract
 * @WARNING DON'T USE GETTER AND SETTER ! Instances of this class will be used a Vue 3 reactive
 * object which SHOULD BE plain javascript object ! For convenience we use class instances but this
 * has some limitations and javascript class getter and setter are not correctly supported which
 * introduced subtle bugs. As rule of thumb we should avoid any public methods with side effects on
 * properties, properties should change be changed either by the constructor or directly by setting
 * them, not through a functions that updates other properties as it can lead to subtle bugs due
 * to Vue reactivity engine.
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
     * @param {[LayerLegend]} legends Layer legends.
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
        legends = [],
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
        this.legends = legends
        this.isLoading = isLoading
        this.hasLegend = this.abstract || this.legends?.length > 0
    }

    getURL() {
        return this.baseURL
    }
}
