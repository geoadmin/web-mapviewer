<script setup>
import { computed, defineAsyncComponent } from 'vue'
import { useStore } from 'vuex'

import { useLayerZIndexCalculation } from '@/modules/map/components/common/z-index.composable'
import OpenLayersAccuracyCircle from '@/modules/map/components/openlayers/OpenLayersAccuracyCircle.vue'
import OpenLayersMarker from '@/modules/map/components/openlayers/OpenLayersMarker.vue'
import OpenLayersVisionCone from '@/modules/map/components/openlayers/OpenLayersVisionCone.vue'
import { OpenLayersMarkerStyles } from '@/modules/map/components/openlayers/utils/markerStyle'
import useDeviceOrientation from '@/modules/map/components/openlayers/utils/useDeviceOrientation.composable'
import { isNumber } from '@/utils/numberUtils'
import { round } from '@/utils/numberUtils'

const OpenLayersDeviceOrientationDebugInfo = defineAsyncComponent(
    () =>
        import('@/modules/map/components/openlayers/debug/OpenLayersDeviceOrientationDebugInfo.vue')
)

const store = useStore()
const { zIndexGeolocation } = useLayerZIndexCalculation()
const { heading, headingDegree, orientation, orientationSampled, listener } = useDeviceOrientation()

const hasDevSiteWarning = computed(() => store.getters.hasDevSiteWarning)
const geolocationPosition = computed(() => store.state.geolocation.position)
const hasOrientation = computed(() => store.state.position.hasOrientation)

const orientationParameters = computed(() => {
    const roundIfNumber = (v, d) => (isNumber(v) ? round(v, d) : `${v}`)

    return [
        { key: 'Listener', value: `${listener.value}` },
        { key: 'Absolute', value: `${orientation.value.absolute}` },
        { key: 'Alpha', value: roundIfNumber(orientation.value.degree, 2) },
        { key: 'Alpha Sampled', value: roundIfNumber(orientationSampled.value.degree, 0) },
        {
            key: 'webkitCompassHeading Sampled',
            value: roundIfNumber(orientationSampled.value.compassHeading, 0),
        },
        { key: 'Heading degree', value: roundIfNumber(headingDegree.value, 0) },
        { key: 'Heading radian', value: roundIfNumber(heading.value, 6) },
    ]
})
</script>

<template>
    <!-- Adding marker and accuracy circle for Geolocation -->
    <OpenLayersAccuracyCircle :z-index="zIndexGeolocation" />
    <OpenLayersVisionCone
        v-if="hasOrientation && geolocationPosition"
        :z-index="zIndexGeolocation + 1"
        :effective-heading="heading"
    />
    <div v-if="hasDevSiteWarning">
        <OpenLayersDeviceOrientationDebugInfo :parameters="orientationParameters" />
    </div>
    <OpenLayersMarker
        :position="geolocationPosition"
        :marker-style="OpenLayersMarkerStyles.POSITION"
        :z-index="zIndexGeolocation + 2"
    />
</template>
