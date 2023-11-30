import { LayerAttribution } from '@/api/layers/AbstractLayer.class'
import GeoAdminLayer from '@/api/layers/GeoAdminLayer.class'
import LayerTypes from '@/api/layers/LayerTypes.enum'
import { BASE_URL_3D_TILES } from '@/config'

/** Metadata for a 3D tile layer (Cesium layer) served by our backend */
export default class GeoAdmin3DLayer extends GeoAdminLayer {
    /**
     * @param {string} layerId The ID of this layer
     * @param {String | null} urlTimestampToUse If this layers' JSON is stored in a dedicated timed
     *   folder, it can be described with this property. This will be added at the end of the URL,
     *   before the /tileset.json (or /style.json, depending on the layer type)
     * @param {boolean} use3dTileSubFolder If the JSON file stored in the /3d-tiles/ sub-folder on
     *   the S3 bucket
     */
    constructor(layerId, urlTimestampToUse = null, use3dTileSubFolder = true) {
        super(
            layerId,
            LayerTypes.VECTOR,
            layerId,
            layerId,
            1.0,
            true,
            [new LayerAttribution('swisstopo', 'https://www.swisstopo.admin.ch/en/home.html')],
            false
        )
        this.use3dTileSubFolder = use3dTileSubFolder
        this.urlTimestampToUse = urlTimestampToUse
    }

    getURL() {
        let rootFolder = ''
        if (this.use3dTileSubFolder) {
            rootFolder = '3d-tiles/'
        }
        let timeFolder = ''
        if (this.urlTimestampToUse) {
            timeFolder = `/${this.urlTimestampToUse}`
        }
        return `${BASE_URL_3D_TILES}${rootFolder}${this.geoAdminID}${timeFolder}/tileset.json`
    }
}
