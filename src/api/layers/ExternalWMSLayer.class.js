import ExternalLayer from '@/api/layers/ExternalLayer.class'
import LayerTypes from '@/api/layers/LayerTypes.enum'

/**
 * Metadata for an external WMS layer.
 *
 * @WARNING DON'T USE GETTER AND SETTER ! Instances of this class will be used a Vue 3 reactive
 * object which SHOULD BE plain javascript object ! For convenience we use class instances but this
 * has some limitations and javascript class getter and setter are not correctly supported which
 * introduced subtle bugs. As rule of thumb we should avoid any public methods with side effects on
 * properties, properties should change be changed either by the constructor or directly by setting
 * them, not through a functions that updates other properties as it can lead to subtle bugs due
 * to Vue reactivity engine.
 */
export default class ExternalWMSLayer extends ExternalLayer {
    /**
     * @param {String} name Name of this layer to be shown to the user
     * @param {number} opacity The opacity of this layer, between 0.0 (transparent) and 1.0 (opaque)
     * @param {boolean} visible If the layer should be shown on the map
     * @param {String} baseURL Base URL to build WMS requests (no endpoint / URL param defined)
     * @param {String} externalLayerId Layer ID to use when requesting the tiles on the server
     * @param {String} wmsVersion WMS protocol version to be used when querying this server, default
     *   is 1.3.0
     * @param {LayerAttribution[]} attributions Description of the data owner(s) for this layer
     *   holder (it typically is the hostname of the server for this layer)
     * @param {String} format Image format for this layer, default is PNG
     * @param {String} abstract Abstract of this layer to be shown to the user
     * @param {[[number, number], [number, number]] | null} extent Layer extent
     * @param {[LayerLegend]} legends Layer legends.
     * @param {boolean} isLoading Set to true if some parts of the layer (e.g. metadata) are still
     *   loading
     */
    constructor({
        name = null,
        opacity = 1.0,
        visible = true,
        baseURL = null,
        externalLayerId = null,
        attributions = null,
        wmsVersion = '1.3.0',
        format = 'png',
        abstract = '',
        extent = null,
        legends = [],
        isLoading = true,
    }) {
        super({
            name,
            // format coming from https://github.com/geoadmin/web-mapviewer/blob/develop/adr/2021_03_16_url_param_structure.md
            // base URL and name must be URL encoded (no & signs or other reserved URL chars must pass, or it could break URL param parsing)
            id: `WMS|${baseUrl}|${externalLayerId}`,
            type: LayerTypes.WMS,
            externalLayerId,
            baseURL,
            opacity,
            visible,
            attributions,
            abstract,
            extent,
            legends,
            isLoading,
        })
        this.wmsVersion = wmsVersion
        this.format = format
    }
}
