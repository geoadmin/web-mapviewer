const openlayersLayerMixin = {
    inject: ['getMap'],
    data() {
        return {
            layer: null,
        }
    },
    mounted() {
        if (this.layer) {
            this.addLayerToMap(this.zIndex, this.layer);
        }
    },
    destroyed() {
        if (this.layer) {
            this.removeLayerFromMap(this.layer);
        }
    },
    methods: {
        addLayerToMap: function (zIndex, layer) {
            if (!zIndex) {
                this.getMap().addLayer(layer);
            } else {
                this.getMap().getLayers().insertAt(zIndex, layer);
            }
        },
        removeLayerFromMap: function (layer) {
            this.getMap().removeLayer(layer);
        }
    },
    watch: {
        layer: function (newLayer) {
            if (this.layer) {
                this.removeLayerFromMap(this.layer);
            }
            if (newLayer) {
                this.addLayerToMap(this.zIndex, newLayer);
            }
        },
        zIndex: function (zIndex) {
            if (this.layer) {
                this.removeLayerFromMap(this.layer);
                this.addLayerToMap(zIndex, this.layer);
            }
        }
    }
}

export default openlayersLayerMixin;
