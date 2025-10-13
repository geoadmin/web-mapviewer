import type { Map } from 'ol'
import type { Layer } from 'ol/layer'
import type { Ref } from 'vue'

import { onBeforeUnmount, onMounted, ref, toValue, watch } from 'vue'

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
 * @param layer OpenLayers layer (Vector, Tile, MapLibre, etc.)
 * @param map OpenLayers Map instance
 * @param zIndex Z-index for layer stacking orders
 */
export default function useAddLayerToMap(
    layer: Layer,
    map: Map,
    zIndex: Readonly<Ref<number>> | number
): {
    addLayerToMap: () => void
    removeLayerFromMap: () => void
} {
    const internalZIndex = ref(toValue(zIndex))

    if (typeof zIndex === 'object' && 'value' in zIndex) {
        watch(zIndex, (newValue) => {
            internalZIndex.value = newValue
            if (newValue >= 0) {
                layer.setZIndex(newValue)
            }
        })
    }

    onMounted(() => {
        addLayerToMap()
    })

    onBeforeUnmount(() => {
        // if the source of this layer can be cleared (if it's a vector layer),
        // we clear it before removing it from the map, ensuring that all features are unloaded
        const source = layer.getSource()
        if (source && 'clear' in source && typeof source.clear === 'function') {
            source.clear()
        }
        layer.setSource(null)
        removeLayerFromMap()
    })

    function addLayerToMap(): void {
        if (internalZIndex.value !== -1) {
            layer.setZIndex(internalZIndex.value)
        }
        map.addLayer(layer)
    }

    function removeLayerFromMap(): void {
        map.removeLayer(layer)
    }

    return {
        addLayerToMap,
        removeLayerFromMap,
    }
}
