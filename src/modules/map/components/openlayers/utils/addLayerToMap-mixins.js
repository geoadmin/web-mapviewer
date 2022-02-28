/**
 * Vue mixin that will handle the addition or removal of an OpenLayers layer. This is a centralized
 * way of describing this logic.
 *
 * Each component that uses this mixin must create a layer (`this.layer`) in their `created(){}`
 * method. This layer will then be added to the map (through dependency injection with `getMap`) to
 * the OL map. The mixin will manage this layer and will remove it from the map as soon as the
 * component that has incorporated this mixin will be removed from the DOM.
 *
 * This layer should be one of OpenLayers JS API layer type, i.e. `/ol/layer/Vector`, `/ol/layer/Tile`, etc...
 *
 * It is also possible to set a prop (or data) called zIndex, which will be used (if defined) to
 * place the layer accordingly in the layer stack of OpenLayers.
 */
const addLayerToMapMixin = {
    inject: ['getMap'],
    data() {
        return {
            isPresentOnMap: false,
        }
    },
    mounted() {
        if (this.layer && !this.isPresentOnMap) {
            this.addLayerToMap(this.zIndex, this.layer)
        }
    },
    unmounted() {
        if (this.layer && this.isPresentOnMap) {
            this.removeLayerFromMap(this.layer)
        }
    },
    methods: {
        addLayerToMap(zIndex, layer) {
            if (this.getMap()) {
                if (zIndex < 0) {
                    this.getMap().addLayer(layer)
                } else {
                    this.getMap().getLayers().insertAt(zIndex, layer)
                }
                this.isPresentOnMap = true
            }
        },
        removeLayerFromMap(layer) {
            if (this.getMap()) {
                this.getMap().removeLayer(layer)
            }
            this.isPresentOnMap = false
        },
    },
    watch: {
        zIndex(zIndex) {
            if (this.layer) {
                this.removeLayerFromMap(this.layer)
                this.addLayerToMap(zIndex, this.layer)
            }
        },
    },
}

export default addLayerToMapMixin
