import GeoAdminLayer from '@/api/layers/GeoAdminLayer.class'
import LayerTypes from '@/api/layers/LayerTypes.enum'

/** Metadata for a vector tile layer (MapLibre layer) */
export default class VectorLayer extends GeoAdminLayer {
    /**
     * @param {string} layerId The ID of this layer
     * @param {number} opacity The opacity of this layer, between 0.0 (transparent) and 1.0 (opaque)
     * @param {string} styleUrl The URL to access the style (Mapbox style JSON)
     */
    constructor(layerId, opacity, styleUrl) {
        super(
            layerId,
            LayerTypes.VECTOR,
            layerId,
            opacity,
            'swisstopo',
            'https://www.swisstopo.admin.ch/en/home.html',
            true
        )
        this.styleUrl = styleUrl
    }

    getURL() {
        return this.styleUrl
    }
}
