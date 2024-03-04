import { LayerAttribution } from '@/api/layers/AbstractLayer.class'
import GeoAdminLayer from '@/api/layers/GeoAdminLayer.class'
import { InvalidLayerDataError } from '@/api/layers/InvalidLayerData.error'
import LayerTypes from '@/api/layers/LayerTypes.enum'

/**
 * Description of a group of layers, or category of layers, in the context of the catalogue. This
 * group can't be added directly on the map, only its layer children can.
 *
 * This is used to describe categories in the topic navigation / representation.
 *
 * @WARNING DON'T USE GETTER AND SETTER ! Instances of this class will be used a Vue 3 reactive
 * object which SHOULD BE plain javascript object ! For convenience we use class instances but this
 * has some limitations and javascript class getter and setter are not correctly supported which
 * introduced subtle bugs. As rule of thumb we should avoid any public methods with side effects on
 * properties, properties should change be changed either by the constructor or directly by setting
 * them, not through a functions that updates other properties as it can lead to subtle bugs due
 * to Vue reactivity engine.
 */
export default class GeoAdminGroupOfLayers extends GeoAdminLayer {
    /**
     * @param {String} layerData.id Unique identifier of this group of layer
     * @param {String} layerData.name Name of this layer group, in the current i18n lang
     * @param {GeoAdminLayer[]} layerData.layers Description of the layers being part of this group
     * @throws InvalidLayerDataError if no `layerData` is given or if it is invalid
     */
    constructor(layerData) {
        if (!layerData) {
            throw new InvalidLayerDataError('Missing group of layer data')
        }
        const { id, name, layers } = layerData
        if (!layers || layers.length === 0) {
            throw new InvalidLayerDataError('Missing child layer in group of layers', layerData)
        }
        super({
            name,
            type: LayerTypes.GROUP,
            geoAdminId: id,
            technicalName: id,
            baseUrl: '',
            attributions: [new LayerAttribution('swisstopo', 'https://www.swisstopo.admin.ch/')],
        })
        this.layers = [...layers]
    }

    clone() {
        let clone = super.clone()
        clone.layers = this.layers.map((layer) => layer.clone())
        return clone
    }
}
