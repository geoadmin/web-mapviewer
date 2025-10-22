<script setup lang="ts">
import { computed } from 'vue'

import { useLayerZIndexCalculation } from '@/modules/map/components/common/z-index.composable'
import OpenLayersInternalLayer from '@/modules/map/components/openlayers/OpenLayersInternalLayer.vue'
import useDrawingStore from '@/store/modules/drawing'
import useLayersStore from '@/store/modules/layers.store'

const layersStore = useLayersStore()
const drawingStore = useDrawingStore()

// We do not want the drawing layer be added to the visible layers while it is being edited, so we filter
// it out in this case
const filteredVisibleLayers = computed(() => {
    // In normal drawing mode show only the drawing layer
    if (drawingStore.drawingOverlay.show && drawingStore.online && layersStore.activeKmlLayer) {
        return layersStore.visibleLayers.filter(
            (layer) =>
                layer.id !== layersStore.activeKmlLayer!.id &&
                layer.id !== drawingStore.temporaryKmlId
        )
    }
    // In report problem drawing mode show the drawing layer and the temporary layer
    if (drawingStore.drawingOverlay.show && !drawingStore.online && drawingStore.temporaryKmlId) {
        return layersStore.visibleLayers.filter((layer) => layer.id !== drawingStore.temporaryKmlId)
    }
    return layersStore.visibleLayers
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
