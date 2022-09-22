import GeoAdminLayer from '@/api/layers/GeoAdminLayer.class'
import LayerTypes from '@/api/layers/LayerTypes.enum'

/** Metadata for a vector tile layer (MapLibre layer) */
export default class VectorLayer extends GeoAdminLayer {
    /**
     * @param {string} layerId The ID of this layer
     * @param {number} opacity The opacity of this layer, between 0.0 (transparent) and 1.0 (opaque)
     * @param {string} styleUrl The URL to access the style (Mapbox style JSON)
     * @param {String} attributionName Name of the data owner of this layer (can be displayed as is
     *   in the UI)
     * @param {String} attributionUrl Link to the data owner website (if there is one)
     * @param {Boolean} isBackground If this layer is to be used as a background layer or not
     *   (background layer are stored in the background wheel on the side of the UI)
     * @param {String} excludeSource Tells the app to filter out Maplibre layers that have this
     *   source (so no tiles will be loaded from this source). Is used to hack the LightBaseMap
     *   style and remove Swisstopo data, so that we only keep what's outside Switzerland (the
     *   rastered national map covers our territory)
     */
    constructor(
        layerId,
        opacity,
        styleUrl,
        attributionName,
        attributionUrl,
        isBackground = false,
        excludeSource = null
    ) {
        super(
            layerId,
            LayerTypes.VECTOR,
            layerId,
            opacity,
            attributionName,
            attributionUrl,
            isBackground
        )
        this.styleUrl = styleUrl
        this.excludeSource = excludeSource
    }

    getURL() {
        return this.styleUrl
    }
}
