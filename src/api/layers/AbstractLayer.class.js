import { InvalidLayerDataError } from '@/api/layers/InvalidLayerData.error'

/**
 * Name (or description) of a data holder for a layer, with the possibility to define a URL
 *
 * @WARNING DON'T USE GETTER AND SETTER ! Instances of this class will be used a Vue 3 reactive
 * object which SHOULD BE plain javascript object ! For convenience we use class instances but this
 * has some limitations and javascript class getter and setter are not correctly supported which
 * introduced subtle bugs. As rule of thumb we should avoid any public methods with side effects on
 * properties, properties should change be changed either by the constructor or directly by setting
 * them, not through a functions that updates other properties as it can lead to subtle bugs due
 * to Vue reactivity engine.
 */
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
 * @WARNING DON'T USE GETTER AND SETTER ! Instances of this class will be used a Vue 3 reactive
 * object which SHOULD BE plain javascript object ! For convenience we use class instances but this
 * has some limitations and javascript class getter and setter are not correctly supported which
 * introduced subtle bugs. As rule of thumb we should avoid any public methods with side effects on
 * properties, properties should change be changed either by the constructor or directly by setting
 * them, not through a functions that updates other properties as it can lead to subtle bugs due
 * to Vue reactivity engine.
 */
export default class AbstractLayer {
    /**
     * @param {String} layerData.name Name of this layer in the current lang
     * @param {String} layerData.id The unique ID of this layer that will be used in the URL to
     *   identify it (and also in subsequent backend services for GeoAdmin layers)
     * @param {LayerTypes} layerData.type See {@link LayerTypes}
     * @param {Number} [layerData.opacity=1.0] Value from 0.0 to 1.0 telling with which opacity this
     *   layer should be shown on the map. Default is `1.0`
     * @param {boolean} [layerData.visible=false] If the layer should be visible on the map or
     *   hidden. Default is `false`
     * @param {LayerAttribution[]} [layerData.attributions=[]] Description of the data owner(s) for
     *   this layer. Default is `[]`
     * @param {Boolean} [layerData.hasTooltip=false] Define if this layer shows tooltip when clicked
     *   on. Default is `false`
     * @param {Boolean} [layerData.hasLegend=false] Define if this layer has a legend that can be
     *   shown to users to explain its content. Default is `false`
     * @param {Boolean} [layerData.isExternal=false] Define if this layer comes from our backend, or
     *   is from another (external) source. Default is `false`
     * @param {boolean} [layerData.isLoading=false] Set to true if some parts of the layer (e.g.
     *   metadata) are still loading. Default is `false`
     * @throws InvalidLayerDataError if no `layerData` is given, or if `layerData.name` or
     *   `layerData.type` aren't valid
     */
    constructor(layerData) {
        if (!layerData) {
            throw new InvalidLayerDataError('Missing layer data', layerData)
        }
        const {
            name = null,
            id = null,
            type = null,
            opacity = 1.0,
            visible = false,
            attributions = [],
            hasTooltip = false,
            hasLegend = false,
            isExternal = false,
            isLoading = false,
        } = layerData
        if (name === null) {
            throw new InvalidLayerDataError('Missing layer name', layerData)
        }
        if (id === null) {
            throw new InvalidLayerDataError('Missing layer ID', layerData)
        }
        if (type === null) {
            throw new InvalidLayerDataError('Missing layer type', layerData)
        }
        this.name = name
        this.id = id
        this.type = type
        this.opacity = opacity
        this.visible = visible
        this.attributions = [...attributions]
        this.hasTooltip = hasTooltip
        this.isExternal = isExternal
        this.isLoading = isLoading
        this.hasLegend = hasLegend
        this.errorKey = null
        this.hasError = false
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

    clone() {
        let clone = Object.assign(Object.create(Object.getPrototypeOf(this)), this)
        clone.attributions = this.attributions.map((attribution) => attribution.clone())
        return clone
    }
}
