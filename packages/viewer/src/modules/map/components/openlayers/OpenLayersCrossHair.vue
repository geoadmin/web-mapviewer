<script setup lang="ts">
import { computed } from 'vue'

import { useLayerZIndexCalculation } from '@/modules/map/components/common/z-index.composable'
import OpenLayersMarker from '@/modules/map/components/openlayers/OpenLayersMarker.vue'
import usePositionStore from '@/store/modules/position'

const positionStore = usePositionStore()
const crossHair = computed(() => positionStore.crossHair)
const crossHairPosition = computed(() => positionStore.crossHairPosition)
const crossHairStyle = computed(() => {
    switch (crossHair.value) {
        case 'bowl':
        case 'circle':
        case 'cross':
        case 'point':
            return crossHair.value
        case 'marker':
            return 'balloon'
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
