import AbstractLayer from '@/api/layers/AbstractLayer.class'

/**
 * @abstract
 * @class GeoAdminLayer Base class for layer coming from our backend, must be extended to a more
 *   specific flavor of Layer (e.g. {@link GeoAdminWMTSLayer}, {@link GeoAdminWMSLayer},
 *   {@link GeoAdminGeoJsonLayer} or {@link GeoAdminAggregateLayer})
 * @WARNING DON'T USE GETTER AND SETTER ! Instances of this class will be used a Vue 3 reactive
 * object which SHOULD BE plain javascript object ! For convenience we use class instances but this
 * has some limitations and javascript class getter and setter are not correctly supported which
 * introduced subtle bugs. As rule of thumb we should avoid any public methods with side effects on
 * properties, properties should change be changed either by the constructor or directly by setting
 * them, not through a functions that updates other properties as it can lead to subtle bugs due
 * to Vue reactivity engine.
 */
export default class GeoAdminLayer extends AbstractLayer {
    /**
     * @param {String} name Name of this layer in the current lang
     * @param {LayerTypes} type See {@link LayerTypes}
     * @param {String} geoAdminId The unique ID of this layer that will be used to identify this
     *   layer
     * @param {String} serverLayerId The ID to use when requesting the WMS/WMTS backend, this might
     *   be different than geoAdminId, and many layers (with different geoAdminId) can in fact
     *   request the same serverLayerId in the end)
     * @param {Number} opacity Value from 0.0 to 1.0 telling with which opacity this layer should be
     *   shown on the map
     * @param {boolean} visible If the layer should be shown on the map
     * @param {LayerAttribution[]} attributions Description of the data owner(s) for this layer
     * @param {Boolean} isBackground If this layer is to be used as a background layer or not
     *   (background layer are stored in the background wheel on the side of the UI)
     * @param {String} baseURL What's the backend base URL to use when requesting tiles/image for
     *   this layer, will be used to construct the URL of this layer later on (if null, the default
     *   WMS/WMTS backend URL will be used)
     * @param {Boolean} isHighlightable Tells if this layer possess features that should be
     *   highlighted on the map after a click (and if the backend will provide valuable information
     *   on the {@link http://api3.geo.admin.ch/services/sdiservices.html#identify-features}
     *   endpoint)
     * @param {Boolean} hasTooltip Define if this layer shows tooltip when clicked on
     * @param {String[]} topics All the topics in which belongs this layer
     * @param {boolean} ensureTrailingSlashInBaseUrl Flag telling if the base URL must always have a
     *   trailing slash. It might be sometime the case that this is unwanted (i.e. for an external
     *   WMS URL already built past the point of URL params, a trailing slash would render this URL
     *   invalid)
     * @param {boolean} isLoading Set to true if some parts of the layer (e.g. metadata) are still
     *   loading
     */
    constructor({
        name = '',
        type = null,
        geoAdminId = '',
        serverLayerId = '',
        opacity = 1.0,
        visible = false,
        attributions = [],
        isBackground = false,
        baseURL = null,
        isHighlightable = false,
        hasTooltip = false,
        topics = [],
        ensureTrailingSlashInBaseUrl = true,
        isLoading = false,
    }) {
        super({ name, type, opacity, visible, attributions, hasTooltip, isLoading })
        super({ name, id: geoAdminId, type, opacity, visible, attributions, hasTooltip, isLoading })
        this.geoAdminId = geoAdminId
        this.serverLayerId = serverLayerId
        this.isBackground = isBackground
        this.baseURL = baseURL
        if (ensureTrailingSlashInBaseUrl && this.baseURL && !this.baseURL.endsWith('/')) {
            this.baseURL = this.baseURL + '/'
        }
        this.isHighlightable = isHighlightable
        this.topics = topics
        this.isSpecificFor3D = geoAdminId.toLowerCase().endsWith('_3d')
    }

    getID() {
        return this.geoAdminId
    }

    /**
     * Returns which topic should be used in URL that needs one topic to be defined (identify or
     * htmlPopup for instance). By default and whenever possible, the viewer should use `ech`. If
     * `ech` is not present in the topics, the first of them should be used to request the backend.
     *
     * @returns {String} The topic to use in request to the backend for this layer
     */
    getTopicForIdentifyAndTooltipRequests() {
        // by default, the frontend should always request `ech`, so if there's no topic that's what we do
        // if there are some topics, we look if `ech` is one of them, if so we return it
        if (this.topics.length === 0 || this.topics.indexOf('ech') !== -1) {
            return 'ech'
        }
        // otherwise we return the first topic to make our backend requests for identify and htmlPopup
        return this.topics[0]
    }
}
