import { LayerAttribution } from '@/api/layers/AbstractLayer.class'
import GeoAdminLayer from '@/api/layers/GeoAdminLayer.class'
import LayerTypes from '@/api/layers/LayerTypes.enum'

/** Metadata for a vector tile layer (MapLibre layer) served by our backend */
export default class GeoAdminVectorLayer extends GeoAdminLayer {
    /**
     * @param {string} layerId The ID of this layer
     * @param {LayerAttribution[]} extraAttributions Extra attribution in case this vector layer is
     *   a mix of many sources
     * @param {String} excludeSource Tells the app to filter out Maplibre layers that have this
     *   source (so no tiles will be loaded from this source). Is used to hack the LightBaseMap
     *   style and remove Swisstopo data, so that we only keep what's outside Switzerland (the
     *   rastered national map covers our territory)
     */
    constructor(layerId, extraAttributions = [], excludeSource = null) {
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
        this.excludeSource = excludeSource
    }

    getURL() {
        return `https://vectortiles.geo.admin.ch/styles/${this.geoAdminID}/style.json`
    }
}
