import ExternalLayer from '@/api/layers/ExternalLayer.class'
import { InvalidLayerDataError } from '@/api/layers/InvalidLayerData.error'
import { encodeExternalLayerParam } from '@/api/layers/layers-external.api'
import LayerTypes from '@/api/layers/LayerTypes.enum'

/**
 * Metadata for an external WMTS layer, that will be defined through a GetCapabilities.xml endpoint
 * (and a layer ID)
 *
 * @WARNING DON'T USE GETTER AND SETTER ! Instances of this class will be used a Vue 3 reactive
 * object which SHOULD BE plain javascript object ! For convenience we use class instances but this
 * has some limitations and javascript class getter and setter are not correctly supported which
 * introduced subtle bugs. As rule of thumb we should avoid any public methods with side effects on
 * properties, properties should change be changed either by the constructor or directly by setting
 * them, not through a functions that updates other properties as it can lead to subtle bugs due
 * to Vue reactivity engine.
 */
export default class ExternalWMTSLayer extends ExternalLayer {
    /**
     * @param {String} externalWmtsData.name Name of this layer to be shown to the user
     * @param {number} [externalWmtsData.opacity=1.0] The opacity of this layer, between 0.0
     *   (transparent) and 1.0 (opaque). Default is `1.0`
     * @param {boolean} [externalWmtsData.visible=true] If the layer should be shown on the map or
     *   be hidden. Default is `true`
     * @param {String} externalWmtsData.baseUrl To the getCapabilities.xml endpoint of the server
     *   for this layer
     * @param {String} externalWmtsData.externalLayerId Layer ID to use when requesting the tiles on
     *   the server
     * @param {LayerAttribution[]} [externalWmtsData.attributions=null] Description of the data
     *   owner(s) for this layer. When `null` is given it uses the default attribution which is
     *   based on the hostname of the GetCapabilities server. Default is `null`
     * @param {String} [externalWmtsData.abstract=''] Abstract of this layer to be shown to the
     *   user. Default is `''`
     * @param {[[number, number], [number, number]] | null} [externalWmtsData.extent=null] Layer
     *   extent. Default is `null`
     * @param {[LayerLegend]} [externalWmtsData.legends=[]] Layer legends. Default is `[]`
     * @param {boolean} [externalWmtsData.isLoading=true] Set to true if some parts of the layer
     *   (e.g. metadata) are still loading. Default is `true`
     * @param {CoordinateSystem[]} [externalWmtsData.availableProjections=[]] All projection that
     *   can be used to request this layer. Default is `[]`
     * @param {ol/WMTS/Options} [externalWmtsData.options] WMTS Get Capabilities options
     * @throws InvalidLayerDataError if no `externalWmtsData` is given or if it is invalid
     */
    constructor(externalWmtsData) {
        if (!externalWmtsData) {
            throw new InvalidLayerDataError('Missing external WMTS layer data', externalWmtsData)
        }
        const {
            name = null,
            opacity = 1.0,
            visible = true,
            baseUrl = null,
            externalLayerId = null,
            attributions = null,
            abstract = '',
            extent = null,
            legends = [],
            isLoading = true,
            availableProjections = [],
            options = null,
        } = externalWmtsData
        super({
            name,
            // format coming from https://github.com/geoadmin/web-mapviewer/blob/develop/adr/2021_03_16_url_param_structure.md
            // NOTE the pipe character needs to be encoded in order to not break the parsing
            id: `WMTS|${encodeExternalLayerParam(baseUrl)}|${encodeExternalLayerParam(externalLayerId)}`,
            type: LayerTypes.WMTS,
            externalLayerId,
            baseUrl,
            ensureTrailingSlashInBaseUrl: true,
            opacity,
            visible,
            attributions,
            abstract,
            extent,
            legends,
            isLoading,
            availableProjections,
        })
        this.options = options
    }
}
