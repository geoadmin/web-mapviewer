import AbstractLayer, { LayerAttribution } from '@/api/layers/AbstractLayer.class.js'
import LayerTypes from '@/api/layers/LayerTypes.enum.js'

export default class GPXLayer extends AbstractLayer {
    /**
     * @param {string} gpxFileUrl URL to the GPX file (can also be a local file URI)
     * @param {boolean | null} [visible=true] If the layer is visible on the map (or hidden). When
     *   `null` is given, then it uses the default value. Default is `true`
     * @param {number | null} [opacity=1.0] The opacity of this layer, between 0.0 (transparent) and
     *   1.0 (opaque). When `null` is given, then it uses the default value. Default is `1.0`
     * @param {string | null} [gpxData=null] Data/content of the GPX file, as a string. Default is
     *   `null`
     * @param {object | null} [gpxMetadata=null] Metadata of the GPX file. This object contains all
     *   the metadata found in the file itself within the <metadata> tag. Default is `null`
     */
    constructor(gpxFileUrl, visible = null, opacity = null, gpxData = null, gpxMetadata = null) {
        const isLocalFile = !gpxFileUrl.startsWith('http')
        const attributionName = isLocalFile ? gpxFileUrl : new URL(gpxFileUrl).hostname
        super(
            gpxMetadata?.name ?? 'GPX',
            LayerTypes.GPX,
            opacity ?? 1.0,
            visible ?? true,
            [new LayerAttribution(attributionName)],
            false, //hasTooltip
            true // isExternal
        )
        this.gpxFileUrl = gpxFileUrl
        this.gpxData = gpxData
        this.gpxMetadata = gpxMetadata
    }
    getID() {
        return `GPX|${this.gpxFileUrl}`
    }

    getURL(_epsgNumber, _timestamp) {
        return this.gpxFileUrl
    }
}
