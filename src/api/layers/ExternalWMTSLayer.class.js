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
     * @param {String} attributionName Name to show the user so that he may know who's the data
     *   holder (it typically is the hostname of the server for this layer)
     */
    constructor(name, opacity, visible, getCapabilitiesUrl, externalLayerId, attributionName) {
        // as we are encoding the name in getID(), we must decode it here when receiving it through the URL parser
        super(decodeURIComponent(name), LayerTypes.WMTS, opacity, visible, attributionName)
        // same gist with the getCap URL, we encode it in getID, so it must be decoded
        this.getCapabilitiesUrl = decodeURIComponent(getCapabilitiesUrl)
        this.externalLayerId = externalLayerId
    }

    getID() {
        // format coming from https://github.com/geoadmin/web-mapviewer/blob/develop/adr/2021_03_16_url_param_structure.md
        return `WMTS|${encodeURIComponent(this.getCapabilitiesUrl)}|${this.externalLayerId}|${encodeURIComponent(this.name)}`
    }

    getURL() {
        return this.getCapabilitiesUrl
    }
}
