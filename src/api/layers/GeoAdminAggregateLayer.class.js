import GeoAdminLayer from '@/api/layers/GeoAdminLayer.class'
import { InvalidLayerDataError } from '@/api/layers/InvalidLayerData.error.js'
import LayerTypes from '@/api/layers/LayerTypes.enum'

/**
 * A sub-layer of an aggregate layer. Will define at which resolution this sub-layer should be shown
 * (shouldn't overlap other sub-layers from the aggregate)
 *
 * @WARNING DON'T USE GETTER AND SETTER ! Instances of this class will be used a Vue 3 reactive
 * object which SHOULD BE plain javascript object ! For convenience we use class instances but this
 * has some limitations and javascript class getter and setter are not correctly supported which
 * introduced subtle bugs. As rule of thumb we should avoid any public methods with side effects on
 * properties, properties should change be changed either by the constructor or directly by setting
 * them, not through a functions that updates other properties as it can lead to subtle bugs due
 * to Vue reactivity engine.
 */
export class AggregateSubLayer {
    /**
     * @param {String} subLayerId The ID used in the GeoAdmin's backend to describe this sub-layer
     * @param {Layer} layer The sub-layer config (can be a {@link GeoAdminGeoJsonLayer}, a
     *   {@link GeoAdminWMTSLayer} or a {@link GeoAdminWMTSLayer})
     * @param {Number} minResolution In meter/px, at which resolution this sub-layer should start to
     *   be visible
     * @param {Number} maxResolution In meter/px, from which resolution the layer should be hidden
     */
    constructor(
        subLayerId,
        layer,
        minResolution = Number.MIN_SAFE_INTEGER,
        maxResolution = Number.MAX_SAFE_INTEGER
    ) {
        this.subLayerId = subLayerId
        this.layer = layer
        this.minResolution = minResolution
        this.maxResolution = maxResolution
    }

    clone() {
        let clone = Object.assign(Object.create(Object.getPrototypeOf(this)), this)
        clone.layer = this.layer.clone()
        return clone
    }
}

/**
 * An aggregate layer is a combination of 2 or more layers where only one of them will be shown at a
 * time. Which one is shown is decided by the map resolution, and by the min/max resolution of all
 * sub-layer's config
 *
 * @WARNING DON'T USE GETTER AND SETTER ! Instances of this class will be used a Vue 3 reactive
 * object which SHOULD BE plain javascript object ! For convenience we use class instances but this
 * has some limitations and javascript class getter and setter are not correctly supported which
 * introduced subtle bugs. As rule of thumb we should avoid any public methods with side effects on
 * properties, properties should change be changed either by the constructor or directly by setting
 * them, not through a functions that updates other properties as it can lead to subtle bugs due
 * to Vue reactivity engine.
 */
export default class GeoAdminAggregateLayer extends GeoAdminLayer {
    /**
     * @param {String} layerData.name The name of this layer in the given lang
     * @param {String} layerData.id The unique ID of this layer in GeoAdmin's backends
     * @param {Number} [layerData.opacity=1.0] The opacity to be applied to this layer. Default is
     *   `1.0`
     * @param {boolean} [layerData.visible=true] If the layer should be shown on the map. Default is
     *   `true`
     * @param {LayerAttribution[]} [layerData.attributions=[]] Description of the data owner(s) for
     *   this layer. Default is `[]`
     * @param {LayerTimeConfig | null} [layerData.timeConfig=null] Time series config (if
     *   available). Default is `null`
     * @param {Boolean} [layerData.isHighlightable=false] Tells if this layer possess features that
     *   should be highlighted on the map after a click (and if the backend will provide valuable
     *   information on the
     *   {@link http://api3.geo.admin.ch/services/sdiservices.html#identify-features} layerData. *
     *   endpoint). Default is `false`
     * @param {Boolean} [layerData.hasTooltip=false] Define if this layer shows tooltip when clicked
     *   on. Default is `false`
     * @param {String[]} [layerData.topics=[]] All the topics in which belongs this layer. Default
     *   is `[]`
     * @param {Boolean} [layerData.hasLegend=false] Define if this layer has a legend that can be
     *   shown to users to explain its content. Default is `false`
     * @param {[AggregateSubLayer]} layerData.subLayers
     * @throws InvalidLayerDataError if no `layerData` is given or if it is invalid
     */
    constructor(layerData) {
        if (!layerData) {
            throw new InvalidLayerDataError('Missing geoadmin aggregate layer data', layerData)
        }
        const {
            name = null,
            id = null,
            opacity = 1.0,
            visible = true,
            attributions = [],
            timeConfig = null,
            isHighlightable = false,
            hasTooltip = false,
            topics = [],
            subLayers = [],
            hasLegend = false,
        } = layerData
        super({
            name,
            type: LayerTypes.AGGREGATE,
            // no base URL for aggregate layers, so giving an empty base URL to accommodate constraints
            baseUrl: '',
            geoAdminId: id,
            technicalName: id,
            opacity,
            visible,
            attributions,
            isHighlightable,
            hasTooltip,
            topics,
            timeConfig,
            hasLegend,
        })
        this.subLayers = [...subLayers]
    }

    getURL() {
        throw new Error(
            "Aggregate layers shouldn't be asked directly for URL, but sub-layers should"
        )
    }

    clone() {
        let clone = super.clone()
        clone.subLayers = this.subLayers.map((subLayer) => subLayer.clone())
        return clone
    }
}
