<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

import { useLayerZIndexCalculation } from '@/modules/map/components/common/z-index.composable'
import OpenLayersInternalLayer from '@/modules/map/components/openlayers/OpenLayersInternalLayer.vue'

const store = useStore()
const visibleLayers = computed(() => store.getters.visibleLayers)
const isCurrentlyDrawing = computed(() => store.state.drawing.drawingOverlay.show)
const currentDrawingKmlLayer = computed(() => store.getters.activeKmlLayer)
const temporaryKmlId = computed(() => store.state.drawing.temporaryKmlId)
const online = computed(() => store.state.drawing.online)

// We do not want the drawing layer be added to the visible layers while it is being edited, so we filter
// it out in this case
const filteredVisibleLayers = computed(() => {
    // In normal drawing mode show only the drawing layer
    if (isCurrentlyDrawing.value && online.value && currentDrawingKmlLayer.value) {
        return visibleLayers.value.filter(
            (layer) =>
                layer.id !== currentDrawingKmlLayer.value.id && layer.id !== temporaryKmlId.value
        )
    }
    // In report problem drawing mode show the drawing layer and the temporary layer
    if (isCurrentlyDrawing.value && !online.value && temporaryKmlId.value) {
        return visibleLayers.value.filter((layer) => layer.id !== temporaryKmlId.value)
    }
    return visibleLayers.value
})

const { getZIndexForLayer } = useLayerZIndexCalculation()
</script>

<template>
    <OpenLayersInternalLayer
        v-for="layer in filteredVisibleLayers"
        :key="layer.id + layer.uuid"
        :layer-config="layer"
        :z-index="getZIndexForLayer(layer)"
    />
</template>
