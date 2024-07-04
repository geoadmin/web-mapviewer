<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

import { useLayerZIndexCalculation } from '@/modules/map/components/common/z-index.composable'
import OpenLayersAccuracyCircle from '@/modules/map/components/openlayers/OpenLayersAccuracyCircle.vue'
import OpenLayersMarker from '@/modules/map/components/openlayers/OpenLayersMarker.vue'
import OpenLayersVisionConeCalculator from '@/modules/map/components/openlayers/OpenLayersVisionConeCalculator.vue'
import { OpenLayersMarkerStyles } from '@/modules/map/components/openlayers/utils/markerStyle'

const store = useStore()
const geolocationActive = computed(() => store.state.geolocation.active)
const geolocationPosition = computed(() => store.state.geolocation.position)

const { zIndexGeolocation } = useLayerZIndexCalculation()
</script>

<template>
    <!-- Adding marker and accuracy circle for Geolocation -->
    <OpenLayersAccuracyCircle v-if="geolocationActive" :z-index="zIndexGeolocation" />
    <div v-if="geolocationActive">
        <OpenLayersVisionConeCalculator :z-index="zIndexGeolocation + 1" />
    </div>
    <OpenLayersMarker
        v-if="geolocationActive"
        :position="geolocationPosition"
        :marker-style="OpenLayersMarkerStyles.POSITION"
        :z-index="zIndexGeolocation + 2"
    />
</template>
