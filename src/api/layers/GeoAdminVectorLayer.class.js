import { LayerAttribution } from '@/api/layers/AbstractLayer.class'
import GeoAdminLayer from '@/api/layers/GeoAdminLayer.class'
import LayerTypes from '@/api/layers/LayerTypes.enum'
import { VECTOR_TILE_BASE_URL } from '@/config'

/**
 * Metadata for a vector tile layer (MapLibre layer) served by our backend
 *
 * @WARNING DON'T USE GETTER AND SETTER ! Instances of this class will be used a Vue 3 reactive
 * object which SHOULD BE plain javascript object ! For convenience we use class instances but this
 * has some limitations and javascript class getter and setter are not correctly supported which
 * introduced subtle bugs. As rule of thumb we should avoid any public methods with side effects on
 * properties, properties should change be changed either by the constructor or directly by setting
 * them, not through a functions that updates other properties as it can lead to subtle bugs due
 * to Vue reactivity engine.
 */
export default class GeoAdminVectorLayer extends GeoAdminLayer {
    /**
     * @param {string} layerId The ID of this layer
     * @param {LayerAttribution[]} extraAttributions Extra attribution in case this vector layer is
     *   a mix of many sources
     */
    constructor(layerId, extraAttributions = []) {
        super({
            name: layerId,
            type: LayerTypes.VECTOR,
            baseUrl: VECTOR_TILE_BASE_URL,
            geoAdminId: layerId,
            technicalName: layerId,
            attributions: [
                ...extraAttributions,
                new LayerAttribution('swisstopo', 'https://www.swisstopo.admin.ch/en/home.html'),
            ],
            isBackground: true,
        })
    }

    getURL() {
        return `${VECTOR_TILE_BASE_URL}styles/${this.geoAdminId}/style.json`
    }
}
