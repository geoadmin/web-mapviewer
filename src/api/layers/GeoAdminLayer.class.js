import AbstractLayer from '@/api/layers/AbstractLayer.class'

/**
 * @abstract
 * @class GeoAdminLayer Base class for layer coming from our backend, must be extended to a more
 *   specific flavor of Layer (e.g. {@link WMTSLayer}, {@link WMSLayer}, {@link GeoJsonLayer} or
 *   {@link AggregateLayer})
 */
export default class GeoAdminLayer extends AbstractLayer {
    /**
     * @param {String} name Name of this layer in the current lang
     * @param {LayerTypes} type See {@link LayerTypes}
     * @param {String} geoAdminID The unique ID of this layer that will be used to request the
     *   different backends of map.geo.admin.ch
     * @param {Number} opacity Value from 0.0 to 1.0 telling with which opacity this layer should be
     *   shown on the map
     * @param {String} attributionName Name of the data owner of this layer (can be displayed as is in the UI)
     * @param {String} attributionUrl Link to the data owner website (if there is one)
     * @param {Boolean} isBackground If this layer is to be used as a background layer or not
     *   (background layer are stored in the background wheel on the side of the UI)
     * @param {String} baseURL What's the backend base URL to use when requesting tiles/image for
     *   this layer, will be used to construct the URL of this layer later on (if null, the default
     *   WMS/WMTS backend URL will be used)
     * @param {Boolean} isHighlightable Tells if this layer possess features that should be
     *   highlighted on the map after a click (and if the backend will provide valuable information
     *   on the {@link http://api3.geo.admin.ch/services/sdiservices.html#identify-features} endpoint)
     * @param {Boolean} hasTooltip Define if this layer shows tooltip when clicked on
     * @param {String[]} topics All the topics in which belongs this layer
     */
    constructor(
        name = '',
        type = null,
        geoAdminID = '',
        opacity = 1.0,
        attributionName = null,
        attributionUrl = null,
        isBackground = false,
        baseURL = null,
        isHighlightable = false,
        hasTooltip = false,
        topics = []
    ) {
        super(name, type, opacity, hasTooltip)
        this.geoAdminID = geoAdminID
        this.isBackground = isBackground
        this.baseURL = baseURL
        if (this.baseURL && !this.baseURL.endsWith('/')) {
            this.baseURL = this.baseURL + '/'
        }
        this.isHighlightable = isHighlightable
        this.topics = topics
        this.isSpecificFor3D = geoAdminID.toLowerCase().endsWith('_3d')
        this.attributionName = attributionName
        this.attributionUrl = attributionUrl
    }

    getID() {
        return this.geoAdminID
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
