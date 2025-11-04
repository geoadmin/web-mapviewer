import type { default as Layer } from 'ol/layer/Layer'
import type Map from 'ol/Map'
import type { Ref } from 'vue'

import VectorSource from 'ol/source/Vector'
import { type MaybeRef, onBeforeUnmount, onMounted, ref, toValue, watch } from 'vue'

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
 * @param layer - The OpenLayers layer to add to the map
 * @param map - The OpenLayers map instance
 * @param zIndex - A Ref containing the z-index value. Must be a Ref to ensure reactivity.
 */
export default function useAddLayerToMap(
    layer: MaybeRef<Layer>,
    map: MaybeRef<Map>,
    zIndex: Ref<number> = ref(-1)
) {
    const internalZIndex = ref(toValue(zIndex))

    watch(zIndex, (newValue) => {
        internalZIndex.value = newValue
        if (newValue >= 0) {
            toValue(layer).setZIndex(newValue)
        }
    })

    onMounted(() => {
        addLayerToMap()
    })

    onBeforeUnmount(() => {
        // if the source of this layer can be cleared (if it's a vector layer),
        // we clear it before removing it from the map, ensuring that all features are unloaded
        if (toValue(layer).getSource() instanceof VectorSource) {
            ;(toValue(layer).getSource() as VectorSource).clear()
        }
        toValue(layer).setSource(null)
        removeLayerFromMap()
    })

    function addLayerToMap(): void {
        if (internalZIndex.value !== -1) {
            toValue(layer).setZIndex(internalZIndex.value)
        }
        toValue(map).addLayer(toValue(layer))
    }

    function removeLayerFromMap(): void {
        toValue(map).removeLayer(toValue(layer))
    }

    return {
        addLayerToMap,
        removeLayerFromMap,
    }
}
