<script setup lang="ts">
import type { Map } from 'ol'

import TileLayer from 'ol/layer/Tile'
import { TileDebug } from 'ol/source'
import TileGrid from 'ol/tilegrid/TileGrid'
import { computed, inject, watch } from 'vue'

import useAddLayerToMap from '@/modules/map/components/openlayers/utils/useAddLayerToMap.composable'
import usePositionStore from '@/store/modules/position.store'

interface Props {
    zIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
    zIndex: -1,
})

const positionStore = usePositionStore()
const currentProjection = computed(() => positionStore.projection)

const layer = new TileLayer({
    source: createDebugSourceForProjection(),
})

const olMap = inject<Map>('olMap')!
useAddLayerToMap(layer, olMap, props.zIndex)

watch(currentProjection, () => layer.setSource(createDebugSourceForProjection()))

function createDebugSourceForProjection(): TileDebug {
    let tileGrid = undefined
    if (!currentProjection.value.usesMercatorPyramid && currentProjection.value.bounds) {
        tileGrid = new TileGrid({
            resolutions: currentProjection.value
                .getResolutionSteps()
                .map((step) => step.resolution),
            extent: currentProjection.value.bounds.flatten,
            origin: currentProjection.value.getTileOrigin(),
        })
    }
    return new TileDebug({
        projection: currentProjection.value.epsg,
        tileGrid,
    })
}
</script>

<template>
    <slot />
</template>
