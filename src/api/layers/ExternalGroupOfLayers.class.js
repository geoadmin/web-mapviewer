import ExternalLayer from '@/api/layers/ExternalLayer.class'
import LayerTypes from '@/api/layers/LayerTypes.enum'

/**
 * Description of a group of layers, that could be added altogether or separately, that stems from a
 * getCapabilities XML parsing. (see
 * https://www.mediamaps.ch/ogc/schemas-xsdoc/sld/1.2/capabilities_1_3_0_xsd.html#Layer)
 *
 * If the group of layer is added to the map, all layers being part of it should be added under this
 * group's name "banner"
 */
export default class ExternalGroupOfLayers extends ExternalLayer {
    /**
     * @param {String} name Name of this layer to be shown to the user
     * @param {String} hostname GetCapabilities URL host name, so that it can be used in the ID
     *   generation
     * @param {ExternalLayer[]} layers Description of the layers being part of this group (they will
     *   all be displayed at the same time, in contrast to an aggregate layer)
     * @param {String} abstract Abstract of this layer to be shown to the user
     * @param {[[number, number], [number, number]] | undefined} extent Layer extent
     */
    constructor(name, hostname, layers, abstract = '', extent = undefined) {
        super(
            name,
            LayerTypes.GROUP,
            `${hostname}:${name.replaceAll(' ', '_')}`,
            null,
            1,
            true,
            [],
            abstract,
            extent
        )
        this.layers = [...layers]
    }

    getID() {
        return this.externalLayerId
    }

    clone() {
        let clone = super.clone()
        clone.layers = this.layers.map((layer) => layer.clone())
        return clone
    }
}
