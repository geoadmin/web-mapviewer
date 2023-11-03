import { LayerAttribution } from '@/api/layers/AbstractLayer.class'
import GeoAdminLayer from '@/api/layers/GeoAdminLayer.class'
import LayerTypes from '@/api/layers/LayerTypes.enum'
import log from '@/utils/logging'

/** @enum */
export const GeoAdminVectorLayerTypes = {
    MAPLIBRE: 'MAPLIBRE',
    CESIUM: 'CESIUM',
}

/** Metadata for a vector tile layer (MapLibre layer) served by our backend */
export default class GeoAdminVectorLayer extends GeoAdminLayer {
    /**
     * @param {string} layerId The ID of this layer
     * @param {GeoAdminVectorLayerTypes} vectorLayerType Which type of vector data this layer stores
     * @param {String | null} urlTimestampToUse If this layers' JSON is stored in a dedicated timed
     *   folder, it can be described with this property. This will be added at the end of the URL,
     *   before the /tileset.json (or /style.json, depending on the layer type)
     * @param {LayerAttribution[]} extraAttributions Extra attribution in case this vector layer is
     *   a mix of many sources
     */
    constructor(layerId, vectorLayerType, urlTimestampToUse = null, extraAttributions = []) {
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
        this.vectorLayerType = vectorLayerType
        this.urlTimestampToUse = urlTimestampToUse
    }

    getURL() {
        let rootFolder
        let jsonFilename
        switch (this.vectorLayerType) {
            case GeoAdminVectorLayerTypes.MAPLIBRE:
                rootFolder = 'styles'
                jsonFilename = 'style.json'
                break
            case GeoAdminVectorLayerTypes.CESIUM:
                rootFolder = '3d-tiles'
                jsonFilename = 'tileset.json'
                break
            default:
                log.error('Vector layer type has not been set, unable to build URL')
                return null
        }
        let timeFolder = ''
        if (this.urlTimestampToUse) {
            timeFolder = `/${this.urlTimestampToUse}`
        }
        return `https://vectortiles.geo.admin.ch/${rootFolder}/${this.geoAdminID}${timeFolder}/${jsonFilename}`
    }
}
