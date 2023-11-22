import ExternalLayer from '@/api/layers/ExternalLayer.class'
import LayerTypes from '@/api/layers/LayerTypes.enum'

/**
 * Metadata for an external WMTS layer, that will be defined through a GetCapabilities.xml endpoint
 * (and a layer ID)
 */
export default class ExternalWMTSLayer extends ExternalLayer {
    /**
     * @param {String} name Name of this layer to be shown to the user
     * @param {number} opacity The opacity of this layer, between 0.0 (transparent) and 1.0 (opaque)
     * @param {boolean} visible If the layer should be shown on the map or be hidden
     * @param {String} baseURL URL to the getCapabilities.xml endpoint of the server for this layer
     * @param {String} externalLayerId Layer ID to use when requesting the tiles on the server
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
        opacity,
        visible,
        baseURL,
        externalLayerId,
        attributions = null,
        abstract = '',
        extent = null,
        isLoading = true
    ) {
        super(
            name,
            LayerTypes.WMTS,
            externalLayerId,
            baseURL,
            opacity,
            visible,
            attributions,
            abstract,
            extent,
            isLoading
        )
    }

    getID() {
        // format coming from https://github.com/geoadmin/web-mapviewer/blob/develop/adr/2021_03_16_url_param_structure.md
        return `WMTS|${this.baseURL}|${this.externalLayerId}`
    }
}
