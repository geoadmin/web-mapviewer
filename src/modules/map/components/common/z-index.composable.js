import LayerTypes from '@/api/layers/LayerTypes.enum'
import { computed } from 'vue'
import { useStore } from 'vuex'

/** Composable that gives utility function to calculate/get layers' and features' z-index */
export function useLayerZIndexCalculation() {
    const store = useStore()
    const is3dActive = computed(() => store.state.cesium.active)
    const backgroundLayers = computed(() => {
        if (is3dActive.value) {
            return store.getters.backgroundLayersFor3D
        }
        return [store.state.layers.currentBackgroundLayer]
    })
    const selectedFeatures = computed(() => store.state.features.selectedFeatures)
    const pinnedLocation = computed(() => store.state.map.pinnedLocation)
    const previewLocation = computed(() => store.state.map.previewedPinnedLocation)
    const crossHair = computed(() => store.state.position.crossHair)

    const startingZIndexForVisibleLayers = computed(() => {
        if (backgroundLayers.value && backgroundLayers.value.length > 0) {
            return backgroundLayers.value.length - 1
        }
        return 0
    })
    const visibleLayersHoldingAZIndex = computed(() => {
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

    const startingZIndexForThingsOnTopOfLayers = computed(
        () => visibleLayersHoldingAZIndex.value.length
    )
    const zIndexHighlightedFeatures = computed(() => startingZIndexForThingsOnTopOfLayers.value)
    const zIndexDroppedPin = computed(() => {
        let zIndex = zIndexHighlightedFeatures.value
        if (selectedFeatures.value.length > 0) {
            zIndex++
        }
        return zIndex
    })
    const zIndexPreviewPosition = computed(() => {
        let zIndex = zIndexDroppedPin.value
        if (pinnedLocation.value) {
            zIndex++
        }
        return zIndex
    })
    const zIndexCrossHair = computed(() => {
        let zIndex = zIndexPreviewPosition.value
        if (previewLocation.value) {
            zIndex++
        }
        return zIndex
    })
    const nextAvailableZIndex = computed(() => {
        let zIndex = zIndexCrossHair.value
        if (crossHair.value) {
            zIndex++
        }
        return zIndex
    })

    /**
     * Gives the z-index of a layer, taking into account if the map is shown in 3D or not. This
     * works for BG layer too.
     *
     * @param {AbstractLayer} layer A background or visible layer
     * @returns {Number} The Z-Index for this layer
     */
    function getZIndexForLayer(layer) {
        if (!layer) {
            return -1
        }
        // checking first of this is a BG layer
        const matchingBackgroundLayer = backgroundLayers.value.find(
            (bgLayer) => bgLayer.getID() === layer.getID()
        )
        if (matchingBackgroundLayer) {
            return backgroundLayers.value.indexOf(matchingBackgroundLayer)
        }
        // if not found in the BG, we check the visible layers
        const matchingLayerInVisibleLayers = visibleLayersHoldingAZIndex.value.find(
            (visibleLayer) => visibleLayer.getID() === layer.getID()
        )
        if (!matchingLayerInVisibleLayers) {
            return -1
        }
        const indexOfLayerInVisibleLayers = visibleLayersHoldingAZIndex.value.indexOf(
            matchingLayerInVisibleLayers
        )
        // checking if there are some group of layers before, meaning more than one z-index for this entry
        const subLayersPresentUnderThisLayer = visibleLayersHoldingAZIndex.value
            // only keeping previous layers (if layer is first, an empty array will be returned by slice(0, 0))
            .slice(0, Math.max(indexOfLayerInVisibleLayers - 1, 0))
            // only keeping groups of layers
            .filter((previousLayer) => previousLayer.type === LayerTypes.GROUP)
            // counting how many layers they have inside each group
            .map((previousGroup) => previousGroup.layers.length)
            // sum
            .reduce((a, b) => a + b, 0)
        return (
            startingZIndexForVisibleLayers.value +
            subLayersPresentUnderThisLayer +
            indexOfLayerInVisibleLayers
        )
    }

    return {
        zIndexHighlightedFeatures,
        zIndexDroppedPin,
        zIndexPreviewPosition,
        zIndexCrossHair,
        nextAvailableZIndex,
        getZIndexForLayer,
    }
}
