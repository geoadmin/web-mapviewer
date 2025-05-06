import { randomIntBetween } from '@geoadmin/numbers'

const Z_INDEX_FOR_LABELS_IN_STYLE = 121

const addLayerToMaplibreMixin = {
    inject: ['getMapLibreMap'],
    data() {
        return {
            layerStyle: null,
            layerSource: null,
            sourceId: `source-${this.layerId ? this.layerId : randomIntBetween(0, 100000)}`,
        }
    },
    computed: {
        zIndexForThisLayer: function () {
            return Z_INDEX_FOR_LABELS_IN_STYLE + (this.zIndex === -1 ? 0 : this.zIndex)
        },
    },
}
export default addLayerToMaplibreMixin
