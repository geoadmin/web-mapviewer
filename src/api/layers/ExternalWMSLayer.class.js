import ExternalLayer from '@/api/layers/ExternalLayer.class'
import { InvalidLayerDataError } from '@/api/layers/InvalidLayerData.error'
import LayerTypes from '@/api/layers/LayerTypes.enum'
import { DEFAULT_MAX_GEOADMIN_RESOLUTION } from '@/config'

/**
 * Metadata for an external WMS layer.
 *
 * @WARNING DON'T USE GETTER AND SETTER ! Instances of this class will be used a Vue 3 reactive
 * object which SHOULD BE plain javascript object ! For convenience we use class instances but this
 * has some limitations and javascript class getter and setter are not correctly supported which
 * introduced subtle bugs. As rule of thumb we should avoid any public methods with side effects on
 * properties, properties should change be changed either by the constructor or directly by setting
 * them, not through a functions that updates other properties as it can lead to subtle bugs due
 * to Vue reactivity engine.
 */
export default class ExternalWMSLayer extends ExternalLayer {
    /**
     * @param {String} externalWmsData.id Layer ID to use when requesting the tiles on the server
     * @param {String} externalWmsData.name Name of this layer to be shown to the user
     * @param {Number} [externalWmsData.opacity=1.0] The opacity of this layer, between 0.0
     *   (transparent) and 1.0 (opaque). Default is `1.0`
     * @param {Boolean} [externalWmsData.visible=true] If the layer should be shown on the map.
     *   Default is `true`
     * @param {String} externalWmsData.baseUrl Base URL to build WMS requests (no endpoint / URL
     *   param defined)
     * @param {String} [externalWmsData.wmsVersion='1.3.0'] WMS protocol version to be used when
     *   querying this server. Default is `'1.3.0'`
     * @param {LayerAttribution[]} [externalWmsData.attributions=null] Description of the data
     *   owner(s) for this layer holder (it typically is the hostname of the server for this layer).
     *   When `null` is given it uses the default attribution which is based on the hostname of the
     *   GetCapabilities server. Default is `null`
     * @param {String} [externalWmsData.format='png'] Image format for this layer. Default is
     *   `'png'`
     * @param {String} [externalWmsData.abstract=''] Abstract of this layer to be shown to the user.
     *   Default is `''`
     * @param {[[number, number], [number, number]] | null} [externalWmsData.extent=null] Layer
     *   extent. Default is `null`
     * @param {[LayerLegend]} [externalWmsData.legends=[]] Layer legends. Default is `[]`
     * @param {Boolean} [externalWmsData.isLoading=true] Set to true if some parts of the layer
     *   (e.g. metadata) are still loading. Default is `true`
     * @param {CoordinateSystem[]} [externalWmsData.availableProjections=[]] All projection that can
     *   be used to request this layer. Default is `[]`
     * @param {boolean} [externalWmsData.hasTooltip=false] Flag telling if this layer can be used in
     *   a GetFeatureInfo request. Default is `false`
     * @param {ExternalLayerGetFeatureInfoCapability | null} [externalWmsData.getFeatureInfoCapability=null]
     *   Configuration describing how to request this layer's server to get feature information.
     *   Default is `null`
     * @param {Number} [externalWmsData.maxResolution=DEFAULT_MAX_GEOADMIN_RESOLUTION] Define the
     *   maximum resolution the layer can reach. Default is `DEFAULT_MAX_GEOADMIN_RESOLUTION`
     * @throws InvalidLayerDataError if no `externalWmsData` is given or if it is invalid
     */
    constructor(externalWmsData) {
        if (!externalWmsData) {
            throw new InvalidLayerDataError('Missing external WMS layer data', externalWmsData)
        }
        const {
            id = null,
            name = null,
            opacity = 1.0,
            visible = true,
            baseUrl = null,
            attributions = null,
            wmsVersion = '1.3.0',
            format = 'png',
            abstract = '',
            extent = null,
            legends = [],
            isLoading = true,
            availableProjections = [],
            hasTooltip = false,
            getFeatureInfoCapability = null,
            maxResolution = DEFAULT_MAX_GEOADMIN_RESOLUTION,
        } = externalWmsData

        super({
            name,
            id,
            type: LayerTypes.WMS,
            baseUrl,
            opacity,
            visible,
            attributions,
            abstract,
            extent,
            legends,
            isLoading,
            availableProjections,
            hasTooltip,
            getFeatureInfoCapability,
            maxResolution,
        })
        this.wmsVersion = wmsVersion
        this.format = format
    }
}
