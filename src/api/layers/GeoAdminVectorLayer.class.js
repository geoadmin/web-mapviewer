import { LayerAttribution } from '@/api/layers/AbstractLayer.class'
import GeoAdminLayer from '@/api/layers/GeoAdminLayer.class'
import LayerTypes from '@/api/layers/LayerTypes.enum'
import { VECTOR_TILE_BASE_URL } from '@/config'

/** Metadata for a vector tile layer (MapLibre layer) served by our backend */
export default class GeoAdminVectorLayer extends GeoAdminLayer {
    /**
     * @param {string} layerId The ID of this layer
     * @param {LayerAttribution[]} extraAttributions Extra attribution in case this vector layer is
     *   a mix of many sources
     */
    constructor(layerId, extraAttributions = []) {
        super(
            layerId,
            LayerTypes.VECTOR,
            layerId,
            1.0,
            true,
            [
                ...extraAttributions,
                new LayerAttribution('swisstopo', 'https://www.swisstopo.admin.ch/en/home.html'),
            ],
            true
        )
    }

    getURL() {
        return `${VECTOR_TILE_BASE_URL}styles/${this.geoAdminID}/style.json`
    }
}
