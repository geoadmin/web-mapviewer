<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

import { useLayerZIndexCalculation } from '@/modules/map/components/common/z-index.composable'
import OpenLayersInternalLayer from '@/modules/map/components/openlayers/OpenLayersInternalLayer.vue'

const store = useStore()
const visibleLayers = computed(() => store.getters.visibleLayers)
const isCurrentlyDrawing = computed(() => store.state.drawing.drawingOverlay.show)
const currentDrawingKmlLayer = computed(() => store.getters.activeKmlLayer)

// We do not want the drawing layer be added to the visible layers while it is being edited, so we filter
// it out in this case
const filteredVisibleLayers = computed(() => {
    if (isCurrentlyDrawing.value && currentDrawingKmlLayer.value) {
        return visibleLayers.value.filter((layer) => layer.id !== currentDrawingKmlLayer.value.id)
    }
    return visibleLayers.value
})

const { getZIndexForLayer } = useLayerZIndexCalculation()
</script>

<template>
    <OpenLayersInternalLayer
        v-for="layer in filteredVisibleLayers"
        :key="layer.id"
        :layer-config="layer"
        :z-index="getZIndexForLayer(layer)"
    />
</template>
