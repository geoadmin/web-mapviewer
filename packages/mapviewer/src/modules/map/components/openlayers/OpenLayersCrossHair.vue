<script setup lang="ts">
import { computed } from 'vue'

import type { OpenLayersMarkerStyle } from '@/modules/map/components/openlayers/utils/markerStyle'

import { useLayerZIndexCalculation } from '@/modules/map/components/common/z-index.composable'
import OpenLayersMarker from '@/modules/map/components/openlayers/OpenLayersMarker.vue'
import usePositionStore from '@/store/modules/position'

const positionStore = usePositionStore()
const crossHair = computed(() => positionStore.crossHair)
const crossHairPosition = computed(() => positionStore.crossHairPosition)
const crossHairStyle = computed<OpenLayersMarkerStyle | undefined>(() => {
    switch (crossHair.value) {
        case 'point':
            return 'point'
        case 'cross':
            return 'cross'
        case 'bowl':
            return 'bowl'
        case 'marker':
            return 'balloon'
        case 'circle':
            return 'circle'
    }
    return undefined
})
const { zIndexCrossHair } = useLayerZIndexCalculation()
</script>

<template>
    <OpenLayersMarker
        v-if="crossHair && crossHairPosition"
        :position="crossHairPosition"
        :marker-style="crossHairStyle"
        :z-index="zIndexCrossHair"
    />
</template>
