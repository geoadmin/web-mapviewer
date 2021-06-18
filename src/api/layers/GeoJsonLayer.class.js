import LayerTypes from '@/api/layers/LayerTypes.enum'
import BODLayer from '@/api/layers/BODLayer.class'

/** Metadata for a GeoJSON layer */
export default class GeoJsonLayer extends BODLayer {
    /**
     * @param name The name of this layer in the current lang
     * @param id The BOD ID of this layer (used to request data and style to the backend)
     * @param opacity The opacity of this layer, between 0.0 (transparent) and 1.0 (opaque)
     * @param geoJsonUrl The URL to use when requesting the GeoJSON data (the true GeoJSON per say...)
     * @param styleUrl The URL to use to request the styling to apply to the data
     */
    constructor(name, id, opacity, geoJsonUrl, styleUrl) {
        super(name, LayerTypes.GEOJSON, id, opacity)
        this.geoJsonUrl = geoJsonUrl
        this.styleUrl = styleUrl
    }

    getURL() {
        return this.geoJsonUrl
    }
}
