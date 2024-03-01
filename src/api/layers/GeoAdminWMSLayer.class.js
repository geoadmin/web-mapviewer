import GeoAdminLayer from '@/api/layers/GeoAdminLayer.class'
import LayerTypes from '@/api/layers/LayerTypes.enum'
import { WMS_BASE_URL } from '@/config'

/**
 * Metadata for WMS layer (WMS stands for Web Map Service). It can either be tiled (requested in
 * chunks, usually 4), or single image (only one request fired for the whole map).
 *
 * @WARNING DON'T USE GETTER AND SETTER ! Instances of this class will be used a Vue 3 reactive
 * object which SHOULD BE plain javascript object ! For convenience we use class instances but this
 * has some limitations and javascript class getter and setter are not correctly supported which
 * introduced subtle bugs. As rule of thumb we should avoid any public methods with side effects on
 * properties, properties should change be changed either by the constructor or directly by setting
 * them, not through a functions that updates other properties as it can lead to subtle bugs due
 * to Vue reactivity engine.
 */
export default class GeoAdminWMSLayer extends GeoAdminLayer {
    /**
     * @param {String} name The name of this layer (lang specific)
     * @param {String} geoAdminId The unique ID of this layer
     * @param {String} serverLayerId The ID of this layer in the GeoAdmin backends (can be the same,
     *   or different from the id)
     * @param {Number} opacity The opacity to apply to this layer (between 0.0 and 1.0)
     * @param {boolean} visible If the layer should be shown on the map
     * @param {LayerAttribution[]} attributions Description of the data owner(s) for this layer
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
     *   on the {@link http://api3.geo.admin.ch/services/sdiservices.html#identify-features}
     *   endpoint)
     * @param {Boolean} hasTooltip Define if this layer shows tooltip when clicked on
     * @param {String[]} topics All the topics in which belongs this layer
     * @param {String} wmsVersion Version of the WMS protocol to use while requesting images on this
     *   layer
     * @param {Number | null} updateDelay Delay after which the data of this layer should be
     *   re-requested (if null is given, no reload will be triggered)
     */
    constructor({
        name = null,
        geoAdminId = null,
        serverLayerId = null,
        opacity = 1.0,
        visible = true,
        attributions = [],
        baseURL = null,
        format = null,
        timeConfig = null,
        wmsVersion = '1.3.0',
        lang = 'en',
        gutter = -1,
        isHighlightable = false,
        hasTooltip = false,
        topics = [],
        updateDelay = null,
    }) {
        super({
            name,
            type: LayerTypes.WMS,
            geoAdminId,
            technicalName,
            opacity,
            visible,
            attributions,
            baseUrl,
            isHighlightable,
            hasTooltip,
            topics,
            // for WMS we do not want a trailing slash in the base URL in case the URL is already defined past the ? portion
            ensureTrailingSlashInBaseUrl: false,
            updateDelay,
        })
        this.format = format
        this.timeConfig = timeConfig
        this.lang = lang
        this.gutter = gutter
        this.wmsVersion = wmsVersion
    }

    clone() {
        const clone = super.clone()
        clone.timeConfig = this.timeConfig?.clone() ?? null
        return clone
    }

    getURL() {
        return this.baseURL ?? WMS_BASE_URL
    }
}
