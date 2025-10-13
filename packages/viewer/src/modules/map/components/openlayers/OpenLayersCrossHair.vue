<script setup lang="ts">
import { computed } from 'vue'

import { useLayerZIndexCalculation } from '@/modules/map/components/common/z-index.composable'
import OpenLayersMarker from '@/modules/map/components/openlayers/OpenLayersMarker.vue'
import { OpenLayersMarkerStyles } from '@/modules/map/components/openlayers/utils/markerStyle'
import usePositionStore from '@/store/modules/position.store'
import { CrossHairs } from '@/store/modules/position.store'

const positionStore = usePositionStore()
const crossHair = computed(() => positionStore.crossHair)
const crossHairPosition = computed(() => positionStore.crossHairPosition)
const crossHairStyle = computed(() => {
    switch (crossHair.value) {
        case CrossHairs.point:
            return OpenLayersMarkerStyles.Point
        case CrossHairs.cross:
            return OpenLayersMarkerStyles.Cross
        case CrossHairs.bowl:
            return OpenLayersMarkerStyles.Bowl
        case CrossHairs.marker:
            return OpenLayersMarkerStyles.Balloon
        case CrossHairs.circle:
            return OpenLayersMarkerStyles.Circle
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
