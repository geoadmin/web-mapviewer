import GeoAdminLayer from '@/api/layers/GeoAdminLayer.class'
import LayerTypes from '@/api/layers/LayerTypes.enum'

/** Metadata for a GeoJSON layer */
export default class GeoAdminGeoJsonLayer extends GeoAdminLayer {
    /**
     * @param name The name of this layer in the current lang
     * @param id The unique ID of this layer in our backend
     * @param opacity The opacity of this layer, between 0.0 (transparent) and 1.0 (opaque)
     * @param {boolean} visible If the layer should be shown on the map
     * @param {LayerAttribution[]} attributions Description of the data owner(s) for this layer
     * @param geoJsonUrl The URL to use when requesting the GeoJSON data (the true GeoJSON per
     *   say...)
     * @param styleUrl The URL to use to request the styling to apply to the data
     */
    constructor(name, id, opacity, visible, attributions, geoJsonUrl, styleUrl) {
        super(name, LayerTypes.GEOJSON, id, opacity, visible, attributions)
        this.geoJsonUrl = geoJsonUrl
        this.styleUrl = styleUrl
        // enforcing HTTPS protocol if nothing has been set, will enable us to request GeoJSON data from localhost
        // otherwise with the mixed methods (HTTP and HTTPS) the request will be rejected
        if (this.styleUrl.startsWith('//')) {
            this.styleUrl = `https:${this.styleUrl}`
        }
    }

    getURL() {
        return this.geoJsonUrl
    }
}
