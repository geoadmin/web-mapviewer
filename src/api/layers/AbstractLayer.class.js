/**
 * Base class for layers' config description, must be extended to a more specific flavor of Layer
 * (e.g. {@link WMTSLayer}, {@link WMSLayer}, {@link GeoJsonLayer}, {@link AggregateLayer} or {@link KMLLayer})
 *
 * @abstract
 */
export default class AbstractLayer {
    /**
     * @param {String} name Name of this layer in the current lang
     * @param {LayerTypes} type See {@link LayerTypes}
     * @param {Number} opacity Value from 0.0 to 1.0 telling with which opacity this layer should be
     *   shown on the map
     * @param {Boolean} hasTooltip Define if this layer shows tooltip when clicked on
     */
    constructor(name = '', type = null, opacity = 1.0, hasTooltip = false) {
        this.name = name
        this.type = type
        this.opacity = opacity
        this.hasTooltip = hasTooltip
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
     * @abstract
     * @returns {String} The unique ID of this layer that will be used in the URL to identify it
     *   (and also in subsequent backend services for GeoAdmin layers)
     */
    getID() {
        throw new Error('You have to implement the method getID!')
    }

    clone() {
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this)
    }
}
