<script setup>
import Feature from 'ol/Feature'
import { Polygon } from 'ol/geom'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { computed, inject, watch } from 'vue'
import { useStore } from 'vuex'

import { selectionBoxStyle } from '@/utils/styleUtils'

const store = useStore()
const lastClick = computed(() => store.state.map.clickInfo)
const selectionPolygon = computed(() => {
    if (lastClick.value?.coordinate.length === 4) {
        const bottomLeft = [lastClick.value.coordinate[0], lastClick.value.coordinate[1]]
        const bottomRight = [lastClick.value.coordinate[2], lastClick.value.coordinate[1]]
        const topRight = [lastClick.value.coordinate[2], lastClick.value.coordinate[3]]
        const topLeft = [lastClick.value.coordinate[0], lastClick.value.coordinate[3]]
        return new Feature({
            geometry: new Polygon([[bottomLeft, bottomRight, topRight, topLeft, bottomLeft]]),
        })
    }
    return null
})

// Create a VectorLayer to show the selection feedback
const map = inject('olMap')
const vectorLayer = new VectorLayer({
    id: 'rectangleSelectionFeedback',
    source: new VectorSource({
        features: [],
    }),
    style: selectionBoxStyle,
    // always on top, like an overlay
    zIndex: 9999,
})

watch(selectionPolygon, () => updateLayer())

function updateLayer() {
    map.removeLayer(vectorLayer)
    vectorLayer.getSource().clear()
    if (selectionPolygon.value) {
        vectorLayer.getSource().addFeature(selectionPolygon.value)
        map.addLayer(vectorLayer)
    }
}
</script>

<template>
    <slot />
</template>
