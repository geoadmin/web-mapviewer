import { randomIntBetween } from "@/utils/numberUtils";

const Z_INDEX_FOR_LABELS_IN_STYLE = 121;

const addLayerToMaplibreMixin = {
    inject: ['getMap', 'getStyle'],
    data() {
        return {
            layerStyle: null,
            layerSource: null,
            sourceId: `source-${this.layerId ? this.layerId : randomIntBetween(0, 100000)}`
        }
    },
    mounted() {
        if (this.layerSource && this.layerStyle) {
            this.addLayerAndSourceToMap(this.layerStyle, this.layerSource);
        }
    },
    beforeUnmount() {
        if (this.layerStyle && this.layerSource) {
            this.removeLayerAndSourceFromMap(this.layerStyle);
        }
    },
    computed: {
        zIndexForThisLayer: function () {
            return Z_INDEX_FOR_LABELS_IN_STYLE + (this.zIndex === -1 ? 0 : this.zIndex);
        }
    },
    methods: {
        addLayerAndSourceToMap: function (layer, source) {
            const map = this.getMap()
            if (!map) {
                return
            }
            if (!map.getSource(this.sourceId)) {
                map.addSource(this.sourceId, source)
            }
            if (!map.getLayer(layer.id)) {
                layer.source = this.sourceId
                map.addLayer(layer)
            }
        },
        removeLayerAndSourceFromMap: function (layer) {
            const map = this.getMap()
            if (!map) {
                return
            }
            map.removeLayer(layer.id)
            map.removeSource(this.sourceId)
        }
    },
}
export default addLayerToMaplibreMixin;
