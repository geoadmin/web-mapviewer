import SelectableFeature from '@/api/features/SelectableFeature.class'
import LayerTypes from '@/api/layers/LayerTypes.enum.js'

/** Describe a feature from the backend, so a feature linked to a backend layer. */
export default class LayerFeature extends SelectableFeature {
    /**
     * @param {AbstractLayer} layer The layer in which this feature belongs
     * @param {Number | String} id The unique feature ID in the layer it is part of
     * @param {String} name The name (localized) of this feature
     * @param {Object | String} data Data for this feature's popup (or tooltip).
     * @param {Number[][]} coordinates Coordinate in the current projection ([[x,y],[x2,y2],...])
     * @param {Number[]} extent Extent of the feature expressed with two point, bottom left and top
     *   right
     * @param {Object} geometry GeoJSON geometry (if exists)
     */
    constructor(layer, id, name, data, coordinates, extent, geometry = null) {
        super(id, coordinates, layer.name, name, geometry, false)
        this.layer = layer
        this.data = data
        this.extent = extent
    }

    // overwriting get ID so that we use the layer ID with the feature ID
    get id() {
        return `${this.layer.getID()}-${this._id}`
    }

    get popupDataCanBeTrusted() {
        // We can't trust the content of the popup data for external layers, and for KML layers.
        // For KML, the issue is that user can create text-rich (HTML) description with links, and such.
        // It would then be possible to do some XSS through this, so we need to sanitize this before showing it.
        return !this.layer.isExternal && this.layer.type !== LayerTypes.KML
    }
}
