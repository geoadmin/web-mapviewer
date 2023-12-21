<script setup>
import TileLayer from 'ol/layer/Tile'
import { TileDebug } from 'ol/source'
import TileGrid from 'ol/tilegrid/TileGrid'
import { computed, inject, toRefs, watch } from 'vue'
import { useStore } from 'vuex'

import useAddLayerToMap from '@/modules/map/components/openlayers/utils/add-layers-to-map.composable'
import CustomCoordinateSystem from '@/utils/coordinates/CustomCoordinateSystem.class'

const props = defineProps({
    zIndex: {
        type: Number,
        default: -1,
    },
})
const { zIndex } = toRefs(props)

const store = useStore()
const currentProjection = computed(() => store.state.position.projection)

const layer = new TileLayer({
    source: createDebugSourceForProjection(),
})

const olMap = inject('olMap', null)
useAddLayerToMap(layer, olMap, zIndex)

watch(currentProjection, () => layer.setSource(createDebugSourceForProjection()))

function createDebugSourceForProjection() {
    let tileGrid = null
    if (currentProjection.value instanceof CustomCoordinateSystem) {
        tileGrid = new TileGrid({
            resolutions: currentProjection.value.getResolutions(),
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
