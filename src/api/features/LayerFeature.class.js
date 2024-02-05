import SelectableFeature from '@/api/features/SelectableFeature.class'

/** Describe a feature from the backend, so a feature linked to a backend layer. */
export default class LayerFeature extends SelectableFeature {
    /**
     * @param {AbstractLayer} layer The layer in which this feature belongs
     * @param {Number | String} id The unique feature ID in the layer it is part of
     * @param {String} name The name (localized) of this feature
     * @param {String} htmlPopup HTML code for this feature's popup (or tooltip)
     * @param {Number[][]} coordinates Coordinate in the current projection ([[x,y],[x2,y2],...])
     * @param {Number[]} extent Extent of the feature expressed with two point, bottom left and top
     *   right
     * @param {Object} geometry GeoJSON geometry (if exists)
     */
    constructor(layer, id, name, htmlPopup, coordinates, extent, geometry = null) {
        super(id, coordinates, name, null, false)
        this._layer = layer
        // for now the backend gives us the description of the feature as HTML
        // it would be good to change that to only data in the future
        this._htmlPopup = htmlPopup
        this._extent = extent
        this._geometry = geometry
    }

    // overwriting get ID so that we use the layer ID with the feature ID
    get id() {
        return `${this._layer.getID()}-${this._id}`
    }

    // getters for all attributes (no setters)
    get layer() {
        return this._layer
    }

    /** @returns {LayerTypes} */
    getLayerType() {
        return this._layer?.type
    }

    get htmlPopup() {
        return this._htmlPopup
    }

    get extent() {
        return this._extent
    }

    get geometry() {
        return this._geometry
    }
}
