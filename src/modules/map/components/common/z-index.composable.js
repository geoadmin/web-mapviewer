import { computed } from 'vue'
import { useStore } from 'vuex'

import LayerTypes from '@/api/layers/LayerTypes.enum'
import log from '@/utils/logging'

/** Composable that gives utility function to calculate/get layers' and features' z-index */
export function useLayerZIndexCalculation() {
    const store = useStore()
    const is3dActive = computed(() => store.state.cesium.active)
    const backgroundLayers = computed(() => {
        if (is3dActive.value) {
            return store.getters.backgroundLayersFor3D
        }
        return [store.getters.currentBackgroundLayer]
    })

    const visibleLayers = computed(() => {
        const visibleLayersWithZIndex = [...backgroundLayers.value]
        if (is3dActive.value) {
            // in 3D, GeoJSON and KML layers are not given a ZIndex as Cesium handles them differently
            // (as primitive layers, on top of all other layers)
            visibleLayersWithZIndex.push(
                ...store.getters.visibleLayers.filter(
                    (visibleLayer) =>
                        [LayerTypes.KML, LayerTypes.GEOJSON].indexOf(visibleLayer.type) === -1
                )
            )
        } else {
            visibleLayersWithZIndex.push(...store.getters.visibleLayers)
        }
        return visibleLayersWithZIndex
    })

    // from here: things that will be exported

    const startingZIndexForThingsOnTopOfLayers = computed(() => {
        // Here we need to take into account the group of layers
        const nbOfSubLayers = visibleLayers.value
            .filter((l) => l?.type === LayerTypes.GROUP)
            // counting how many layers they have inside each group, note the first layer of the
            // group is already counted in the visibleLayers, therefore remove 1 from the total here
            .map((l) => l.layers.length - 1)
            .reduce((a, b) => a + b, 0)
        return visibleLayers.value.length + nbOfSubLayers
    })
    const zIndexHighlightedFeatures = computed(() => startingZIndexForThingsOnTopOfLayers.value)
    const zIndexDroppedPin = computed(() => zIndexHighlightedFeatures.value + 1)
    const zIndexPreviewPosition = computed(() => zIndexDroppedPin.value + 1)
    const zIndexCrossHair = computed(() => zIndexPreviewPosition.value + 1)
    const zIndexGeolocation = computed(() => zIndexCrossHair.value + 1)
    const zIndexTileInfo = computed(() => zIndexGeolocation.value + 1)
    const zIndexLayerExtents = computed(() => zIndexTileInfo.value + 1)
    const nextAvailableZIndex = computed(() => zIndexLayerExtents.value + 1)

    /**
     * Gives the z-index of a layer, taking into account if the map is shown in 3D or not. This
     * works for BG layer too.
     *
     * @param {AbstractLayer} layer A background or visible layer
     * @returns {Number} The Z-Index for this layer
     */
    function getZIndexForLayer(layer) {
        // trying to find a match among the visible layers
        const layerIndex = visibleLayers.value.indexOf(layer)
        if (layerIndex === -1) {
            log.error(
                `Layer ${layer.id} not found in visible layers, cannot return its zIndex, return -1`
            )
            return -1
        }
        // checking if there are some group of layers before, meaning more than one z-index for this entry
        const subLayersPresentUnderThisLayer = visibleLayers.value
            // only keeping previous layers (if layer is first, an empty array will be returned by slice(0, 0))
            .slice(0, layerIndex)
            // only keeping groups of layers
            .filter((previousLayer) => previousLayer?.type === LayerTypes.GROUP)
            // counting how many layers they have inside each group, note the first layer of the
            // group is already counted in the visibleLayers, therefore remove 1 from the total here
            .map((previousGroup) => previousGroup.layers.length - 1)
            // sum
            .reduce((a, b) => a + b, 0)
        return subLayersPresentUnderThisLayer + layerIndex
    }

    return {
        zIndexHighlightedFeatures,
        zIndexDroppedPin,
        zIndexPreviewPosition,
        zIndexCrossHair,
        zIndexGeolocation,
        zIndexTileInfo,
        zIndexLayerExtents,
        nextAvailableZIndex,
        getZIndexForLayer,
    }
}
