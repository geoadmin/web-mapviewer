<script setup lang="ts">
import type { Map } from 'ol'

import log from '@swissgeo/log'
import { styleUtils } from '@swissgeo/theme'
import Feature from 'ol/Feature'
import { Polygon } from 'ol/geom'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { Style } from 'ol/style'
import { v4 as uuidv4 } from 'uuid'
import { computed, inject, watch } from 'vue'

import useMapStore from '@/store/modules/map'

const mapStore = useMapStore()
const selectionPolygon = computed<Feature<Polygon> | undefined>(() => {
    if (!mapStore.rectangleSelectionExtent || mapStore.rectangleSelectionExtent.length !== 4) {
        return
    }
    const [minX, minY, maxX, maxY] = mapStore.rectangleSelectionExtent
    const bottomLeft = [minX, minY]
    const bottomRight = [maxX, minY]
    const topRight = [maxX, maxY]
    const topLeft = [minX, maxY]
    return new Feature({
        geometry: new Polygon([[bottomLeft, bottomRight, topRight, topLeft, bottomLeft]]),
    })
})

// Create a VectorLayer to show the selection feedback
const olMap = inject<Map>('olMap')
if (!olMap) {
    log.error('OpenLayersMap component not found')
    throw new Error('OpenLayersMap component not found')
}

const vectorLayer = new VectorLayer({
    properties: {
        id: 'rectangleSelectionFeedback',
        uuid: uuidv4(),
    },
    source: new VectorSource({
        features: [],
    }),
    style: new Style({
        stroke: styleUtils.redStroke,
    }),
    // always on top, like an overlay
    zIndex: styleUtils.StyleZIndex.OnTop,
})

watch(selectionPolygon, () => updateLayer())

function updateLayer(): void {
    olMap?.removeLayer(vectorLayer)
    const source = vectorLayer.getSource() as VectorSource<Feature<Polygon>>
    if (source) {
        source.clear()
    }
    if (selectionPolygon.value && source) {
        source.addFeature(selectionPolygon.value)
        olMap?.addLayer(vectorLayer)
    }
}
</script>

<template>
    <slot />
</template>
