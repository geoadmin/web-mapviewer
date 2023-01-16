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
     * @param {String} getCapabilitiesUrl URL to the getCapabilities.xml endpoint of the server for
     *   this layer
     * @param {String} externalLayerId Layer ID to use when requesting the tiles on the server
     * @param {LayerAttribution[]} attributions Description of the data owner(s) for this layer
     */
    constructor(name, opacity, visible, getCapabilitiesUrl, externalLayerId, attributions) {
        super(
            // as we are encoding the name in getID(), we must decode it here when receiving it through the URL parser
            name,
            LayerTypes.WMTS,
            externalLayerId,
            // same thing with the getCap URL, we encode it in getID, so it must be decoded
            getCapabilitiesUrl,
            opacity,
            visible,
            attributions
        )
    }

    getID() {
        // format coming from https://github.com/geoadmin/web-mapviewer/blob/develop/adr/2021_03_16_url_param_structure.md
        return `WMTS|${this.baseURL}|${this.externalLayerId}|${this.name}`
    }
}
