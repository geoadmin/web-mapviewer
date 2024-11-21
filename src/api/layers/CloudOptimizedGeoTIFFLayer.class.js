import AbstractLayer, { LayerAttribution } from '@/api/layers/AbstractLayer.class'
import { InvalidLayerDataError } from '@/api/layers/InvalidLayerData.error'
import LayerTypes from '@/api/layers/LayerTypes.enum'

/**
 * Metadata for an external Cloud-Optimized GeoTIFF layer
 *
 * @WARNING DON'T USE GETTER AND SETTER ! Instances of this class will be used a Vue 3 reactive
 * object which SHOULD BE plain javascript object ! For convenience, we use class instances but this
 * has some limitations and javascript class getter and setter are not correctly supported which
 * introduced subtle bugs. As rule of thumb we should avoid any public methods with side effects on
 * properties, properties should change be changed either by the constructor or directly by setting
 * them, not through a functions that updates other properties as it can lead to subtle bugs due
 * to Vue reactivity engine.
 */
export default class CloudOptimizedGeoTIFFLayer extends AbstractLayer {
    /**
     * @param {String} cogConfig.fileSource The URL to access the COG data.
     * @param {Boolean} [cogConfig.visible=true] If the layer is visible on the map (or hidden).
     *   When `null` is given, then it uses the default value. Default is `true`
     * @param {Number} [cogConfig.opacity=1.0] The opacity of this layer, between 0.0 (transparent)
     *   and 1.0 (opaque). When `null` is given, then it uses the default value. Default is `1.0`
     * @param {String | null} [cogConfig.data=null] Data/content of the COG file, as a string.
     *   Default is `null`
     * @param {Number | null} [cogConfig.noDataValue] Which value will be describing the absence of
     *   data in this COG. Will be used to create transparency whenever this value is present.
     * @param {[Number, Number, Number, Number] | null} [cogConfig.extent] The extent of this COG.
     * @throws InvalidLayerDataError if no `cogConfig` is given or if it is invalid
     */
    constructor(cogConfig) {
        if (!cogConfig) {
            throw new InvalidLayerDataError('Missing COG layer data', cogConfig)
        }
        const {
            fileSource = null,
            visible = true,
            opacity = 1.0,
            data = null,
            noDataValue = null,
            extent = null,
        } = cogConfig
        if (fileSource === null) {
            throw new InvalidLayerDataError('Missing COG file source', cogConfig)
        }
        const isLocalFile = !fileSource.startsWith('http')
        const attributionName = isLocalFile ? fileSource : new URL(fileSource).hostname
        const fileName = isLocalFile
            ? fileSource
            : fileSource.substring(fileSource.lastIndexOf('/') + 1)
        super({
            name: fileName,
            id: fileSource,
            type: LayerTypes.COG,
            baseUrl: fileSource,
            opacity: opacity ?? 1.0,
            visible: visible ?? true,
            attributions: [new LayerAttribution(attributionName)],
            isExternal: true,
            hasDescription: false,
            hasLegend: false,
        })
        this.isLocalFile = isLocalFile
        this.fileSource = fileSource
        this.data = data
        this.noDataValue = noDataValue
        this.extent = extent
    }
}
