<script setup lang="ts">
import type { Map } from 'ol'

import log from '@swissgeo/log'
import { round } from '@swissgeo/numbers'
import { computed, defineAsyncComponent, inject, onBeforeMount, onBeforeUnmount } from 'vue'

import type { ActionDispatcher } from '@/store/types'

import { useLayerZIndexCalculation } from '@/modules/map/components/common/z-index.composable'
import OpenLayersAccuracyCircle from '@/modules/map/components/openlayers/OpenLayersAccuracyCircle.vue'
import OpenLayersMarker from '@/modules/map/components/openlayers/OpenLayersMarker.vue'
import OpenLayersVisionCone from '@/modules/map/components/openlayers/OpenLayersVisionCone.vue'
import useDeviceOrientation from '@/modules/map/components/openlayers/utils/useDeviceOrientation.composable.ts'
import useGeolocationStore from '@/store/modules/geolocation'
import usePositionStore from '@/store/modules/position'
import useUiStore from '@/store/modules/ui'

const OpenLayersDeviceOrientationDebugInfo = defineAsyncComponent(
    () =>
        import('@/modules/map/components/openlayers/debug/OpenLayersDeviceOrientationDebugInfo.vue')
)

const dispatcher: ActionDispatcher = {
    name: 'OpenLayersGeolocationFeedback.vue',
}

const olMap = inject<Map>('olMap')
if (!olMap) {
    log.error('OpenLayersMap is not available')
    throw new Error('OpenLayersMap is not available')
}

const geolocationStore = useGeolocationStore()
const positionStore = usePositionStore()
const uiStore = useUiStore()
const { zIndexGeolocation } = useLayerZIndexCalculation()
const { heading, headingDegree, orientation, orientationSampled } = useDeviceOrientation()

const hasDevSiteWarning = computed(() => uiStore.hasDevSiteWarning)
const geolocationPosition = computed(() => geolocationStore.position)
const isTracking = computed(() => geolocationStore.tracking)
const hasOrientation = computed(() => positionStore.hasOrientation)

const orientationParameters = computed(() => {
    return [
        {
            title: 'Default listener',
            parameters: [
                { key: 'Absolute', value: orientation.value.default.absolute.toString() },
                { key: 'Alpha', value: round(orientation.value.default.degree, 2).toFixed(2) },
                {
                    key: 'Alpha Sampled',
                    value: round(orientationSampled.value.default.degree, 0).toFixed(0),
                },
                {
                    key: 'webkitCompassHeading Sampled',
                    value: round(orientationSampled.value.default.compassHeading, 0).toFixed(0),
                },
            ],
        },
        {
            title: 'Absolute listener',
            parameters: [
                { key: 'Alpha', value: round(orientation.value.absolute.degree, 2).toFixed(2) },
                {
                    key: 'Alpha Sampled',
                    value: round(orientationSampled.value.absolute.degree, 0).toFixed(0),
                },
                {
                    key: 'webkitCompassHeading Sampled',
                    value: round(orientationSampled.value.absolute.compassHeading, 0).toFixed(0),
                },
            ],
        },
        {
            title: 'Heading',
            parameters: [
                { key: 'Heading degree', value: round(headingDegree.value, 0).toFixed(0) },
                { key: 'Heading radian', value: round(heading.value, 6).toFixed(6) },
            ],
        },
        {
            title: 'User Agent',
            parameters: [{ value: navigator.userAgent, hasCopyBtn: true }],
        },
        {
            title: 'Vendor',
            parameters: [{ value: navigator.vendor, hasCopyBtn: true }],
        },
    ]
})

// To avoid re-centering the map on the position, we need to listen to pointerdrag event, because
// the center in store is set during the moveend event, so this means that if we disable tracking
// by using the store event, it can lead to race condition when moving the map between the
// moveend event and the geolocation event.
onBeforeMount(() => {
    olMap.on('pointerdrag', disableTrackingAndAutoRotation)
})
onBeforeUnmount(() => {
    olMap.un('pointerdrag', disableTrackingAndAutoRotation)
})

function disableTrackingAndAutoRotation(): void {
    if (
        isTracking.value &&
        geolocationStore.position &&
        geolocationStore.position !== positionStore.center
    ) {
        // When the map has been dragged we disabled geolocation tracking to avoid to re-center the
        // map when the user want to have something else in the center. Also disabled the auto rotation
        // because auto rotation rotate the map using the position as center and it doesn't make sense
        // to rotate if the location is not centered (this is also the same behavior as on the swisstopo
        // app)
        log.debug(`Map started moving, disabled geolocation tracking and autorotation`)
        geolocationStore.setGeolocationTracking(false, dispatcher)
        positionStore.setAutoRotation(false, dispatcher)
    }
}
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
        v-if="geolocationPosition"
        :position="geolocationPosition"
        marker-style="position"
        :z-index="zIndexGeolocation + 2"
    />
</template>
