import LayerTypes from './LayerTypes.enum'

/** Name (or description) of a data holder for a layer, with the possibility to define a URL */
export class LayerAttribution {
    /**
     * @param {String} name Name of the data owner of this layer (can be displayed as is in the UI)
     * @param {String} url Link to the data owner website (if there is one)
     */
    constructor(name, url = null) {
        this.name = name
        this.url = url
    }

    clone() {
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this)
    }
}

/**
 * Base class for layers' config description, must be extended to a more specific flavor of Layer
 * (e.g. {@link GeoAdminWMTSLayer}, {@link GeoAdminWMSLayer}, {@link GeoAdminGeoJsonLayer},
 * {@link GeoAdminAggregateLayer} or {@link KMLLayer})
 *
 * @abstract
 */
export default class AbstractLayer {
    /**
     * @param {String} name Name of this layer in the current lang
     * @param {LayerTypes} type See {@link LayerTypes}
     * @param {Number} opacity Value from 0.0 to 1.0 telling with which opacity this layer should be
     *   shown on the map
     * @param {boolean} visible If the layer should be visible on the map or hidden
     * @param {LayerAttribution[]} attributions Description of the data owner(s) for this layer
     * @param {Boolean} hasTooltip Define if this layer shows tooltip when clicked on
     * @param {Boolean} isExternal Define if this layer comes from our backend, or is from another
     *   (external) source
     */
    constructor(
        name = '',
        type = null,
        opacity = 1.0,
        visible = false,
        attributions = [],
        hasTooltip = false,
        isExternal = false
    ) {
        this.name = name
        this.type = type
        this.opacity = opacity
        this.visible = visible
        this.attributions = [...attributions]
        this.hasTooltip = hasTooltip
        this.isExternal = isExternal
    }

    /**
     * @abstract
     * @param {Number | null} epsgNumber The EPSG number of the projection system to use if needed
     *   for the layer
     * @param {String | null} timestamp A timestamp to be used, instead of the one define in the
     *   time config of the layer. Is used to preview a specific timestamp without having to change
     *   the layer's config (very useful for the time slider for instance)
     * @returns {String} The URL to use to request tile/image/data for this layer
     */
    getURL(_epsgNumber = null, _timestamp = null) {
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
        let clone = Object.assign(Object.create(Object.getPrototypeOf(this)), this)
        clone.attributions = this.attributions.map((attribution) => attribution.clone())
        return clone
    }

    /**
     * Get layer metadata
     *
     * @returns {Object | null} Metadata object
     */
    async getMetadata() {
        return null
    }

    get hasLegend() {
        return this.type !== LayerTypes.KML && !this.isExternal
    }
}
