import GeoAdminWMSLayer from '@/api/layers/GeoAdminWMSLayer.class'

/**
 * Metadata for an external WMS layer, we can use mostly what is already done in the class
 * GeoAdminWMSLayer, except the ID definition. With an external WMS, we need to declare the ID as
 * described in adr/2021_03_16_url_param_structure.md, not just the ID of the layer requested on the
 * server.
 */
export default class ExternalWMSLayer extends GeoAdminWMSLayer {
    /**
     * @param {String} name Name of this layer to be shown to the user
     * @param {number} opacity The opacity of this layer, between 0.0 (transparent) and 1.0 (opaque)
     * @param {boolean} visible If the layer should be shown on the map
     * @param {String} serverBaseURL Base URL to build WMS requests (no endpoint / URL param
     *   defined)
     * @param {String} layerId Layer ID to use when requesting the tiles on the server
     * @param {String} wmsVersion WMS protocol version to be used when querying this server, default
     *   is 1.3.0
     * @param {String} attributionName Name to show the user so that he may know who's the data
     *   holder (it typically is the hostname of the server for this layer)
     * @param {String} format Image format for this layer, default is PNG
     */
    constructor(
        name,
        opacity,
        visible,
        serverBaseURL,
        layerId,
        attributionName,
        wmsVersion = '1.3.0',
        format = 'png'
    ) {
        super(
            // same as name, as we are encoding it in getID() we must decode it
            decodeURIComponent(name),
            layerId,
            opacity,
            visible,
            attributionName,
            null,
            // we are encoding name in getID(), we must decode it to remove Unicode escaped chars
            decodeURIComponent(serverBaseURL),
            format,
            null,
            wmsVersion
        )
        // as we are inheriting from GeoAdminWMSLayer so that we do not copy and paste the getURL() function,
        // we need to declare that we are an external as if we were inheriting from ExternalLayer class
        this.isExternal = true
    }

    getID() {
        // format coming from https://github.com/geoadmin/web-mapviewer/blob/develop/adr/2021_03_16_url_param_structure.md
        // base URL and name must be URL encoded (no & signs or other reserved URL chars must pass, or it could break URL param parsing)
        return `WMS|${encodeURIComponent(this.baseURL)}|${this.geoAdminID}|${
            this.wmsVersion
        }|${encodeURIComponent(this.name)}`
    }
}
