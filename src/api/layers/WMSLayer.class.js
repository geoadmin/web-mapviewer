import { WMS_BASE_URL } from '@/config'
import LayerTypes from '@/api/layers/LayerTypes.enum'
import AbstractLayer from '@/api/layers/AbstractLayer.class'

/**
 * Metadata for WMS layer (WMS stands for Web Map Service). It can either be tiled (requested in
 * chunks, usually 4), or single image (only one request fired for the whole map).
 */
export default class WMSLayer extends AbstractLayer {
    /**
     * @param {String} name The name of this layer (lang specific)
     * @param {String} id The ID of this layer in the BOD
     * @param {Number} opacity The opacity to apply to this layer (between 0.0 and 1.0)
     * @param {String} baseURL The backend to call for tiles
     * @param {String} format In which image format the backend must be requested
     * @param {LayerTimeConfig} timeConfig Settings telling which year has to be used when request
     *   tiles to the backend
     * @param {String} lang The lang ISO code to use when requesting the backend (WMS images can
     *   have text that are language dependent)
     * @param {Number} gutter How much of a gutter (extra pixels around the image) we want. This is
     *   specific for tiled WMS, if unset this layer will be a considered a single tile WMS.
     * @param {Boolean} isHighlightable Tells if this layer possess features that should be
     *   highlighted on the map after a click (and if the backend will provide valuable information
     *   on the {@link http://api3.geo.admin.ch/services/sdiservices.html#identify-features} endpoint)
     * @param {Boolean} hasTooltip Define if this layer shows tooltip when clicked on
     * @param {String[]} topics All the topics in which belongs this layer
     */
    constructor(
        name,
        id,
        opacity,
        baseURL,
        format,
        timeConfig,
        lang = 'en',
        gutter = -1,
        isHighlightable = false,
        hasTooltip = false,
        topics = []
    ) {
        super(
            name,
            LayerTypes.WMS,
            id,
            opacity,
            false,
            baseURL,
            isHighlightable,
            hasTooltip,
            topics
        )
        this.format = format
        this.timeConfig = timeConfig
        this.lang = lang
        this.gutter = gutter
    }

    getURL() {
        const url = new URL(this.baseURL ? this.baseURL : WMS_BASE_URL)
        const params = url.searchParams
        params.set('SERVICE', 'WMS')
        params.set('VERSION', '1.3.0')
        params.set('REQUEST', 'GetMap')
        params.set('FORMAT', `image/${this.format}`)
        params.set('TRANSPARENT', 'true')
        params.set('LAYERS', this.id)
        params.set('LANG', this.lang)
        // if a timestamp is defined, and is different from 'all' (no need to pass 'all' to a WMS, that's the default timestamp used under the hood)
        if (this.timeConfig && this.timeConfig.currentTimestamp !== 'all') {
            params.set('TIME', this.timeConfig.currentTimestamp)
        }
        return url.toString()
    }
}
