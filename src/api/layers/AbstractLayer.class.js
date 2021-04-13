/**
 * @abstract
 * @class
 * @name layers:Layer Base class for Layer config description, must be extended to a more specific
 *   flavor of Layer (e.g. {@link WMTSLayer}, {@link WMSLayer}, {@link GeoJsonLayer} or {@link
 *   AggregateLayer})
 */
export default class AbstractLayer {
    /**
     * @param {String} name Name of this layer in the current lang
     * @param {LayerTypes} type See {@link LayerTypes}
     * @param {String} id The BOD ID of this layer that will be used to request the backend
     * @param {Number} opacity Value from 0.0 to 1.0 telling with which opacity this layer should be
     *   shown on the map
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
        id = '',
        opacity = 1.0,
        isBackground = false,
        baseURL = null,
        isHighlightable = false,
        hasTooltip = false,
        topics = []
    ) {
        this.name = name
        this.type = type
        this.id = id
        this.opacity = opacity
        this.isBackground = isBackground
        this.baseURL = baseURL
        if (this.baseURL && !this.baseURL.endsWith('/')) {
            this.baseURL = this.baseURL + '/'
        }
        this.isHighlightable = isHighlightable
        this.hasTooltip = hasTooltip
        this.topics = topics
        this.isSpecificFor3D = id.toLowerCase().endsWith('_3d')
        this.visible = false
        this.projection = 'EPSG:3857'
    }

    /**
     * @abstract
     * @returns {String} The URL to use to request tile/image/data for this layer
     */
    getURL() {
        throw new Error('You have to implement the method getURL!')
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

    clone() {
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this)
    }
}
