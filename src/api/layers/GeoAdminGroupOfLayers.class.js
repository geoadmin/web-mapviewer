import GeoAdminLayer from '@/api/layers/GeoAdminLayer.class'
import LayerTypes from '@/api/layers/LayerTypes.enum'

/**
 * Description of a group of layers, or category of layers, in the context of the catalogue. This
 * group can't be added directly on the map, only its layer children can.
 *
 * This is used to describe categories in the topic navigation / representation.
 */
export default class GeoAdminGroupOfLayers extends GeoAdminLayer {
    /**
     * @param {String} id Unique identifier of this group of layer
     * @param {String} name Name of this layer group, in the current i18n lang
     * @param {GeoAdminLayer[]} layers Description of the layers being part of this group
     */
    constructor(id, name, layers) {
        super(name, LayerTypes.GROUP, id, id)
        this.layers = [...layers]
    }

    clone() {
        let clone = super.clone()
        clone.layers = this.layers.map((layer) => layer.clone())
        return clone
    }
}
