import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

/**
 * Vue composable that will handle the addition or removal of an OpenLayers layer. This is a
 * centralized way of describing this logic.
 *
 * The composable will manage the layer and will remove it from the map as soon as the component
 * that has used this composable is removed from the DOM.
 *
 * This layer should be one of OpenLayers JS API layer type, i.e. `/ol/layer/Vector`,
 * `/ol/layer/Tile`, etc...
 *
 * It is also possible to set a prop called zIndex, which will be used (if defined) to place the
 * layer accordingly in the layer stack of OpenLayers.
 *
 * @param {VectorLayer | TileLayer | MapLibreLayer} layer
 * @param {Map} map
 * @param {Readonly<Ref<Number>>} zIndex
 */
export default function useAddLayerToMap(layer, map, zIndex) {
    const internalZIndex = ref(zIndex.value)

    watch(zIndex, (newValue) => {
        internalZIndex.value = newValue
        if (newValue >= 0) {
            layer.setZIndex(newValue)
        }
    })

    onMounted(() => {
        addLayerToMap()
    })

    onBeforeUnmount(() => {
        // if the source of this layer can be cleared (if it's a vector layer),
        // we clear it before removing it from the map, ensuring that all features are unloaded
        if (layer.getSource()?.clear) {
            layer.getSource().clear()
        }
        layer.setSource(null)
        removeLayerFromMap()
    })

    function addLayerToMap() {
        if (internalZIndex.value !== -1) {
            layer.setZIndex(internalZIndex.value)
        }
        map.addLayer(layer)
    }
    function removeLayerFromMap() {
        map.removeLayer(layer)
    }
}
