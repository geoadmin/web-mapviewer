import {randomIntBetween} from "@/numberUtils";

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
            this.addLayerAndSourceToMap(this.zIndex, this.layerStyle, this.layerSource);
        }
    },
    destroyed() {
        if (this.layerStyle && this.layerSource) {
            this.removeLayerAndSourceFromMap(this.zIndexForThisLayer);
        }
    },
    computed: {
        zIndexForThisLayer: function () {
            return Z_INDEX_FOR_LABELS_IN_STYLE + (this.zIndex === -1 ? 0 : this.zIndex);
        }
    },
    methods: {
        addLayerAndSourceToMap: function (zIndex, layer, source) {
            const style = this.getStyle();
            style.sources[this.sourceId] = source;
            layer.source = this.sourceId;
            style.layers.splice(this.zIndexForThisLayer, 0, layer);
            this.getMap().setStyle(style);
        },
        removeLayerAndSourceFromMap: function (zIndex) {
            const style = this.getStyle();
            style.layers.splice(zIndex, 1);
            delete style.sources[this.sourceId];
            this.getMap().setStyle(style);
        }
    },
    watch: {
        layerSource: function (newSource) {
            const style = this.getStyle();
            style.sources[this.sourceId] = newSource;
            this.getMap().setStyle(style);
        },
        layerStyle: function (newStyle) {
            if (this.layerStyle) {
                this.removeLayerAndSourceFromMap(this.zIndexForThisLayer)
            }
            this.addLayerAndSourceToMap(this.zIndexForThisLayer, newStyle, this.layerSource);
        },
    },
}
export default addLayerToMaplibreMixin;
