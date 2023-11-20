import ExternalLayer from '@/api/layers/ExternalLayer.class'
import LayerTypes from '@/api/layers/LayerTypes.enum'

/**
 * Description of a group of layers, that could be added altogether or separately, that stems from a
 * getCapabilities XML parsing. (see
 * https://www.mediamaps.ch/ogc/schemas-xsdoc/sld/1.2/capabilities_1_3_0_xsd.html#Layer)
 *
 * If the group of layer is added to the map, all layers being part of it should be added under this
 * group's name "banner"
 */
export default class ExternalGroupOfLayers extends ExternalLayer {
    /**
     * @param {String} name Name of this layer to be shown to the user
     * @param {number} opacity The opacity of this layer, between 0.0 (transparent) and 1.0 (opaque)
     * @param {boolean} visible If the layer should be shown on the map
     * @param {String} baseUrl GetCapabilities base URL
     * @param {String} layerId Layer ID of the group to be found in GetCapabilities
     * @param {ExternalLayer[]} layers Description of the layers being part of this group (they will
     *   all be displayed at the same time, in contrast to an aggregate layer)
     * @param {String} abstract Abstract of this layer to be shown to the user
     * @param {LayerAttribution[] | null} attributions Description of the data owner(s) for this
     *   layer. When `null` is given it uses the default attribution which is based on the hostname
     *   of the GetCapabilities server.
     * @param {[[number, number], [number, number]] | null} extent Layer extent
     * @param {boolean} isLoading Set to true if some parts of the layer (e.g. metadata) are still
     *   loading
     */
    constructor(
        name,
        opacity,
        visible,
        baseUrl,
        layerId,
        layers = [],
        attributions = null,
        abstract = '',
        extent = null,
        isLoading = true
    ) {
        super(
            name,
            LayerTypes.GROUP,
            layerId,
            baseUrl,
            opacity,
            visible,
            attributions,
            abstract,
            extent,
            isLoading
        )
        this.layers = [...layers]
    }

    getID() {
        // format coming from https://github.com/geoadmin/web-mapviewer/blob/develop/adr/2021_03_16_url_param_structure.md
        return `GRP|${this.baseURL}|${this.externalLayerId}`
    }
    clone() {
        let clone = super.clone()
        clone.layers = this.layers.map((layer) => layer.clone())
        return clone
    }
}
