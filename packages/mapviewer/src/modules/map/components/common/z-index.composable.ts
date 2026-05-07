import type { GeoAdminGroupOfLayers, Layer } from '@swissgeo/layers'

import log from '@swissgeo/log'
import { computed } from 'vue'

import useCesiumStore from '@/store/modules/cesium'
import useLayersStore from '@/store/modules/layers'

/** Composable that gives utility functions to calculate/get layers' and features' z-index */
export function useLayerZIndexCalculation() {
    const cesiumStore = useCesiumStore()
    const layersStore = useLayersStore()

    const is3dActive = computed(() => cesiumStore.active)
    const backgroundLayers = computed(() => {
        if (is3dActive.value) {
            return cesiumStore.backgroundLayersFor3D
        }
        return [layersStore.currentBackgroundLayer]
    })

    const visibleLayers = computed(() => {
        const visibleLayersWithZIndex = [...backgroundLayers.value]
        if (is3dActive.value) {
            visibleLayersWithZIndex.push(
                ...layersStore.visibleLayers.filter(
                    (visibleLayer) => !['KML', 'GEOJSON'].includes(visibleLayer.type)
                )
            )
        } else {
            visibleLayersWithZIndex.push(...layersStore.visibleLayers)
        }
        return visibleLayersWithZIndex
    })

    const startingZIndexForThingsOnTopOfLayers = computed(() => {
        const nbOfSubLayers = visibleLayers.value
            .filter((l) => l?.type === 'GROUP')
            .map((l) => (l as GeoAdminGroupOfLayers)?.layers.length - 1)
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
    const zIndexSelectionRectangle = computed(() => zIndexLayerExtents.value + 1)
    const nextAvailableZIndex = computed(() => zIndexSelectionRectangle.value + 1)

    function getZIndexForLayer(layer: Layer): number {
        const layerIndex = visibleLayers.value.indexOf(layer)
        if (layerIndex === -1) {
            log.error(
                `Layer ${layer.id} not found in visible layers, cannot return its zIndex, return -1`
            )
            return -1
        }
        const subLayersPresentUnderThisLayer = visibleLayers.value
            .slice(0, layerIndex)
            .filter((previousLayer) => previousLayer?.type === 'GROUP')
            .map((previousGroup) => (previousGroup as GeoAdminGroupOfLayers)?.layers.length - 1)
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
        zIndexSelectionRectangle,
        nextAvailableZIndex,
        getZIndexForLayer,
    }
}
