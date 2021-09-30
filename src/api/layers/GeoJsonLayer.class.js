import LayerTypes from '@/api/layers/LayerTypes.enum'
import GeoAdminLayer from '@/api/layers/GeoAdminLayer.class'

/** Metadata for a GeoJSON layer */
export default class GeoJsonLayer extends GeoAdminLayer {
    /**
     * @param name The name of this layer in the current lang
     * @param id The unique ID of this layer in our backend
     * @param opacity The opacity of this layer, between 0.0 (transparent) and 1.0 (opaque)
     * @param {String} attributionName Name of the data owner of this layer (can be displayed as is in the UI)
     * @param {String} attributionUrl Link to the data owner website (if there is one)
     * @param geoJsonUrl The URL to use when requesting the GeoJSON data (the true GeoJSON per say...)
     * @param styleUrl The URL to use to request the styling to apply to the data
     */
    constructor(name, id, opacity, attributionName, attributionUrl, geoJsonUrl, styleUrl) {
        super(name, LayerTypes.GEOJSON, id, opacity, attributionName, attributionUrl)
        this.geoJsonUrl = geoJsonUrl
        this.styleUrl = styleUrl
    }

    getURL() {
        return this.geoJsonUrl
    }
}
