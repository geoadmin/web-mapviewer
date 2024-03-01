import { LayerAttribution } from '@/api/layers/AbstractLayer.class'
import GeoAdminLayer from '@/api/layers/GeoAdminLayer.class'
import LayerTypes from '@/api/layers/LayerTypes.enum'
import { BASE_URL_3D_TILES } from '@/config'

/**
 * Metadata for a 3D tile layer (Cesium layer) served by our backend
 *
 * @WARNING DON'T USE GETTER AND SETTER ! Instances of this class will be used a Vue 3 reactive
 * object which SHOULD BE plain javascript object ! For convenience we use class instances but this
 * has some limitations and javascript class getter and setter are not correctly supported which
 * introduced subtle bugs. As rule of thumb we should avoid any public methods with side effects on
 * properties, properties should change be changed either by the constructor or directly by setting
 * them, not through a functions that updates other properties as it can lead to subtle bugs due
 * to Vue reactivity engine.
 */
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
        super({
            name: layerId,
            type: LayerTypes.VECTOR,
            technicalName: layerId,
            geoAdminId: layerId,
            baseUrl: BASE_URL_3D_TILES,
            opacity: 1.0,
            visible: true,
            attributions: [
                new LayerAttribution('swisstopo', 'https://www.swisstopo.admin.ch/en/home.html'),
            ],
            hasTooltip: false,
        })
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
        return `${BASE_URL_3D_TILES}${rootFolder}${this.geoAdminId}${timeFolder}/tileset.json`
    }
}
