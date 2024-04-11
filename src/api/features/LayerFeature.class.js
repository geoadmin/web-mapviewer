import SelectableFeature from '@/api/features/SelectableFeature.class'
import LayerTypes from '@/api/layers/LayerTypes.enum.js'

/** Describe a feature from the backend, so a feature linked to a backend layer. */
export default class LayerFeature extends SelectableFeature {
    /**
     * @param {AbstractLayer} featureData.layer The layer in which this feature belongs
     * @param {Number | String} featureData.id The unique feature ID in the layer it is part of
     * @param {String} featureData.name The name (localized) of this feature
     * @param {Object | String} featureData.data Data for this feature's popup (or tooltip).
     * @param {[[Number, Number]]} featureData.coordinates Coordinate in the current projection
     *   ([[x,y],[x2,y2],...])
     * @param {[Number, Number, Number, Number]} featureData.extent Extent of the feature expressed
     *   with two point, bottom left and top right
     * @param {Object | null} [featureData.geometry=null] GeoJSON geometry (if exists). Default is
     *   `null`
     */
    constructor(featureData) {
        const { layer, id, name, data, coordinates, extent, geometry = null } = featureData
        super({
            id,
            coordinates,
            // using the layer name as title (so that user can differentiate the source)
            title: layer.name,
            // and the name as description (so that we do not lose track of this data)
            description: name,
            extent,
            geometry,
            isEditable: false,
        })
        console.error(`LayerFeature constructor: `, featureData, coordinates)
        this.layer = layer
        this.data = data
        // We can't trust the content of the popup data for external layers, and for KML layers.
        // For KML, the issue is that user can create text-rich (HTML) description with links, and such.
        // It would then be possible to do some XSS through this, so we need to sanitize this before showing it.
        this.popupDataCanBeTrusted = !this.layer.isExternal && this.layer.type !== LayerTypes.KML
    }
}
