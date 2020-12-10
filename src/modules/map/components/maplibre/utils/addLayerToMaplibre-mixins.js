import {randomIntBetween} from "../../../../../numberUtils";

const Z_INDEX_FOR_LABELS_IN_STYLE = 121;

const addLayerToMaplibreMixin = {
    inject: ['getMap', 'getStyle'],
    data() {
        return {
            layerStyle: null,
            layerSource: null,
            sourceId: `source-${randomIntBetween(0, 100000)}`
        }
    },
    mounted() {
        if (this.layerSource) {
            this.getStyle().sources[this.sourceId] = this.layerSource;
        }
        if (this.layerStyle) {
            this.addLayerToMap(this.zIndex, this.layerStyle);
        }
    },
    destroyed() {
        if (this.layerStyle) {
            this.removeLayerFromMap(this.layerStyle);
        }
    },
    computed: {
        zIndexForThisLayer: function () {
            return Z_INDEX_FOR_LABELS_IN_STYLE + (this.zIndex === -1 ? 0 : this.zIndex);
        }
    },
    methods: {
        addLayerToMap: function (zIndex, layer) {
            layer.source = this.sourceId;
            const style = this.getStyle();
            style.layers = style.layers.splice(this.zIndexForThisLayer, 0, layer);
            console.log('style', this.getStyle())
            // this.getMap().setStyle(style);
        },
        removeLayerFromMap: function (layerStyle) {
            this.getStyle().layers = this.getStyle().layers.filter(layer => layer.id === layerStyle.id);
        }
    },
}
export default addLayerToMaplibreMixin;
