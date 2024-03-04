import ExternalLayer from '@/api/layers/ExternalLayer.class'
import { InvalidLayerDataError } from '@/api/layers/InvalidLayerData.error'
import LayerTypes from '@/api/layers/LayerTypes.enum'

/**
 * Description of a group of layers, that could be added altogether or separately, that stems from a
 * getCapabilities XML parsing. (see
 * https://www.mediamaps.ch/ogc/schemas-xsdoc/sld/1.2/capabilities_1_3_0_xsd.html#Layer)
 *
 * If the group of layer is added to the map, all layers being part of it should be added under this
 * group's name "banner"
 *
 * @WARNING DON'T USE GETTER AND SETTER ! Instances of this class will be used a Vue 3 reactive
 * object which SHOULD BE plain javascript object ! For convenience we use class instances but this
 * has some limitations and javascript class getter and setter are not correctly supported which
 * introduced subtle bugs. As rule of thumb we should avoid any public methods with side effects on
 * properties, properties should change be changed either by the constructor or directly by setting
 * them, not through a functions that updates other properties as it can lead to subtle bugs due
 * to Vue reactivity engine.
 */
export default class ExternalGroupOfLayers extends ExternalLayer {
    /**
     * @param {String} externalLayerData.name Name of this layer to be shown to the user
     * @param {number} [externalLayerData.opacity=1.0] The opacity of this layer, between 0.0
     *   (transparent) and 1.0 (opaque). Default is `1.0`
     * @param {boolean} [externalLayerData.visible=true] If the layer should be shown on the map.
     *   Default is `true`
     * @param {String} externalLayerData.baseUrl GetCapabilities base URL
     * @param {String} externalLayerData.externalLayerId Layer ID of the group to be found in
     *   GetCapabilities
     * @param {ExternalLayer[]} externalLayerData.layers Description of the layers being part of
     *   this group (they will all be displayed at the same time, in contrast to an aggregate
     *   layer)
     * @param {String} [externalLayerData.abstract=''] Abstract of this layer to be shown to the
     *   user. Default is `''`
     * @param {LayerAttribution[]} [externalLayerData.attributions=null] Description of the data
     *   owner(s) for this layer. When `null` is given it uses the default attribution which is
     *   based on the hostname of the GetCapabilities server. Default is `null`
     * @param {[[number, number], [number, number]] | null} [externalLayerData.extent=null] Layer
     *   extent. Default is `null`
     * @param {[LayerLegend]} [externalLayerData.legends=[]] Layer legends. Default is `[]`
     * @param {boolean} [externalLayerData.isLoading=true] Set to true if some parts of the layer
     *   (e.g. metadata) are still loading. Default is `true`
     * @throws InvalidLayerDataError if no `externalLayerData` is given or if it is invalid
     */
    constructor(externalLayerData) {
        if (!externalLayerData) {
            throw new InvalidLayerDataError('Missing external layer data', externalLayerData)
        }
        const {
            name = null,
            opacity = 1.0,
            visible = true,
            baseUrl = null,
            externalLayerId = null,
            layers = [],
            attributions = null,
            abstract = '',
            extent = null,
            legends = [],
            isLoading = true,
        } = externalLayerData
        if (!layers?.length > 0) {
            throw new InvalidLayerDataError(
                'Missing sublayers in external group of layers',
                externalLayerData
            )
        }
        super({
            name,
            // format coming from https://github.com/geoadmin/web-mapviewer/blob/develop/adr/2021_03_16_url_param_structure.md
            // NOTE we don't differentiate between group of layers and regular WMS layer. This differentiation was not
            // done the legacy parameter and is not required.
            id: `WMS|${baseUrl}|${externalLayerId}`,
            type: LayerTypes.GROUP,
            externalLayerId,
            baseUrl,
            opacity,
            visible,
            attributions,
            abstract,
            extent,
            legends,
            isLoading,
        })
        this.layers = [...layers]
    }

    clone() {
        let clone = super.clone()
        clone.layers = this.layers.map((layer) => layer.clone())
        return clone
    }
}
