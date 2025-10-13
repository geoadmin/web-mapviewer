<script setup lang="ts">
import type { Map } from 'ol'

import Feature from 'ol/Feature'
import { Polygon } from 'ol/geom'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { v4 as uuidv4 } from 'uuid'
import { computed, inject, watch } from 'vue'

import useMapStore from '@/store/modules/map.store'
import { selectionBoxStyle } from '@/utils/styleUtils'

const mapStore = useMapStore()
const rectangleExtent = computed(() => mapStore.rectangleSelectionExtent)
const selectionPolygon = computed((): Feature<Polygon> | undefined => {
    if (rectangleExtent.value && rectangleExtent.value.length === 4) {
        const [minX, minY, maxX, maxY] = rectangleExtent.value
        const bottomLeft = [minX, minY]
        const bottomRight = [maxX, minY]
        const topRight = [maxX, maxY]
        const topLeft = [minX, maxY]
        return new Feature({
            geometry: new Polygon([[bottomLeft, bottomRight, topRight, topLeft, bottomLeft]]),
        })
    }
    return undefined
})

// Create a VectorLayer to show the selection feedback
const map = inject<Map>('olMap')!
const vectorLayer = new VectorLayer({
    properties: {
        id: 'rectangleSelectionFeedback',
        uuid: uuidv4(),
    },
    source: new VectorSource({
        features: [],
    }),
    style: selectionBoxStyle,
    // always on top, like an overlay
    zIndex: 9999,
})

watch(selectionPolygon, () => updateLayer())

function updateLayer(): void {
    map.removeLayer(vectorLayer)
    const source = vectorLayer.getSource() as VectorSource<Feature<Polygon>>
    if (source) {
        source.clear()
    }
    if (selectionPolygon.value && source) {
        source.addFeature(selectionPolygon.value)
        map.addLayer(vectorLayer)
    }
}
</script>

<template>
    <slot />
</template>
