<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

import { useLayerZIndexCalculation } from '@/modules/map/components/common/z-index.composable'
import OpenLayersMarker from '@/modules/map/components/openlayers/OpenLayersMarker.vue'
import { OpenLayersMarkerStyles } from '@/modules/map/components/openlayers/utils/markerStyle'
import { CrossHairs } from '@/store/modules/position.store'

const store = useStore()
const crossHair = computed(() => store.state.position.crossHair)
const crossHairPosition = computed(() => store.state.position.crossHairPosition)
const crossHairStyle = computed(() => {
    switch (crossHair.value) {
        case CrossHairs.point:
            return OpenLayersMarkerStyles.POINT
        case CrossHairs.cross:
            return OpenLayersMarkerStyles.CROSS
        case CrossHairs.bowl:
            return OpenLayersMarkerStyles.BOWL
        case CrossHairs.marker:
            return OpenLayersMarkerStyles.BALLOON
        case CrossHairs.circle:
            return OpenLayersMarkerStyles.CIRCLE
    }
    return null
})
const { zIndexCrossHair } = useLayerZIndexCalculation()
</script>

<template>
    <OpenLayersMarker
        v-if="crossHair"
        :position="crossHairPosition"
        :marker-style="crossHairStyle"
        :z-index="zIndexCrossHair"
    />
</template>
