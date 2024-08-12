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
const { heading, headingDegree, orientation, orientationSampled } = useDeviceOrientation()

const hasDevSiteWarning = computed(() => store.getters.hasDevSiteWarning)
const geolocationPosition = computed(() => store.state.geolocation.position)
const hasOrientation = computed(() => store.state.position.hasOrientation)

const orientationParameters = computed(() => {
    return [
        {
            title: 'Default listener',
            parameters: [
                { key: 'Absolute', value: `${orientation.value.default.absolute}` },
                { key: 'Alpha', value: roundIfNumber(orientation.value.default.degree, 2) },
                {
                    key: 'Alpha Sampled',
                    value: roundIfNumber(orientationSampled.value.default.degree, 0),
                },
                {
                    key: 'webkitCompassHeading Sampled',
                    value: roundIfNumber(orientationSampled.value.default.compassHeading, 0),
                },
            ],
        },
        {
            title: 'Absolute listener',
            parameters: [
                { key: 'Alpha', value: roundIfNumber(orientation.value.absolute.degree, 2) },
                {
                    key: 'Alpha Sampled',
                    value: roundIfNumber(orientationSampled.value.absolute.degree, 0),
                },
                {
                    key: 'webkitCompassHeading Sampled',
                    value: roundIfNumber(orientationSampled.value.absolute.compassHeading, 0),
                },
            ],
        },
        {
            title: 'Heading',
            parameters: [
                { key: 'Heading degree', value: roundIfNumber(headingDegree.value, 0) },
                { key: 'Heading radian', value: roundIfNumber(heading.value, 6) },
            ],
        },
        {
            title: 'User Agent',
            parameters: [{ value: navigator.userAgent }],
        },
    ]
})

const roundIfNumber = (v, d) => (isNumber(v) ? round(v, d) : `${v}`)
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
