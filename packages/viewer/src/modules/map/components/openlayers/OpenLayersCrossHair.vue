<script setup lang="js">
import { computed } from 'vue'
import { useStore } from 'vuex'

import { useLayerZIndexCalculation } from '@/modules/map/components/common/z-index.composable'
import OpenLayersMarker from '@/modules/map/components/openlayers/OpenLayersMarker.vue'
import { OpenLayersMarkerStyles } from '@/modules/map/components/openlayers/utils/markerStyle.js'
import { CrossHairs } from '@/store/modules/position.store'

const store = useStore()
const crossHair = computed(() => store.state.position.crossHair)
const crossHairPosition = computed(() => store.state.position.crossHairPosition)
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
