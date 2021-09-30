import LayerTypes from '@/api/layers/LayerTypes.enum'
import GeoAdminLayer from '@/api/layers/GeoAdminLayer.class'

/**
 * A sub-layer of an aggregate layer. Will define at which resolution this sub-layer should be shown
 * (shouldn't overlap other sub-layers from the aggregate)
 */
export class AggregateSubLayer {
    /**
     * @param {String} subLayerId The ID used in the GeoAdmin's backend to describe this sub-layer
     * @param {Layer} layer The sub-layer config (can be a {@link GeoJsonLayer}, a {@link WMTSLayer}
     *   or a {@link WMTSLayer})
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
}

/**
 * An aggregate layer is a combination of 2 or more layers where only one of them will be shown at a
 * time. Which one is shown is decided by the map resolution, and by the min/max resolution of all
 * sub-layer's config
 */
export default class AggregateLayer extends GeoAdminLayer {
    /**
     * @param {String} name The name of this layer in the given lang
     * @param {String} id The unique ID of this layer in GeoAdmin's backends
     * @param {Number} opacity The opacity to be applied to this layer
     * @param {String} attributionName Name of the data owner of this layer (can be displayed as is in the UI)
     * @param {String} attributionUrl Link to the data owner website (if there is one)
     * @param {LayerTimeConfig} timeConfig Time series config (if available)
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
        attributionName,
        attributionUrl,
        timeConfig,
        isHighlightable = false,
        hasTooltip = false,
        topics = []
    ) {
        super(
            name,
            LayerTypes.AGGREGATE,
            id,
            opacity,
            attributionName,
            attributionUrl,
            false,
            null,
            isHighlightable,
            hasTooltip,
            topics
        )
        this.timeConfig = timeConfig
        this.subLayers = []
    }

    /** @param {AggregateSubLayer} subLayer */
    addSubLayer(subLayer) {
        this.subLayers.push(subLayer)
    }

    getURL() {
        throw new Error(
            "Aggregate layers shouldn't be asked directly for URL, but sub-layers should"
        )
    }
}
