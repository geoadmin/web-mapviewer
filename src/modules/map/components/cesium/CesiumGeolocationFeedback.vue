<script setup>
import { Cartesian3, Color, HeightReference } from 'cesium'
import proj4 from 'proj4'
import { computed, inject, onMounted, watch } from 'vue'
import { useStore } from 'vuex'

import { WGS84 } from '@/utils/coordinates/coordinateSystems'
import {
    geolocationAccuracyCircleFillColor,
    geolocationPointBorderColor,
    geolocationPointBorderWidth,
    geolocationPointFillColor,
    geolocationPointWidth,
} from '@/utils/styleUtils'

const getViewer = inject('getViewer')

const store = useStore()
const projection = computed(() => store.state.position.projection)
const geolocationActive = computed(() => store.state.geolocation.active)
const geolocationPosition = computed(() => store.state.geolocation.position)
const accuracy = computed(() => store.state.geolocation.accuracy)

const geolocationPositionCartesian3 = computed(() => {
    if (
        geolocationActive.value &&
        geolocationPosition.value &&
        // default value of the geolocation position in the store is [0,0], but giving that to
        // Cesium to calculate a Cartesian3 breaks its calculation process, so we guard against it
        geolocationPosition.value.some((coordinate) => coordinate !== 0)
    ) {
        const geolocationPositionWGS84 = proj4(
            projection.value.epsg,
            WGS84.epsg,
            geolocationPosition.value
        )
        return Cartesian3.fromDegrees(geolocationPositionWGS84[0], geolocationPositionWGS84[1])
    }
    return null
})

let accuracyCircleEntity = null
let geolocationPositionEntity = null

onMounted(() => {
    if (geolocationActive.value) {
        activateTracking()
    }
})

watch(geolocationActive, (isNowActive) => {
    if (isNowActive) {
        activateTracking()
    } else {
        removeTracking()
    }
})
watch(geolocationPositionCartesian3, (newPosition) => {
    if (newPosition && geolocationActive.value) {
        if (!accuracyCircleEntity || !geolocationPositionEntity) {
            activateTracking()
        } else {
            accuracyCircleEntity.ellipse.position = newPosition
            geolocationPositionEntity.point.position = newPosition
        }
    }
})
watch(accuracy, (newAccuracy) => {
    if (accuracyCircleEntity) {
        accuracyCircleEntity.ellipse.semiMajorAxis = newAccuracy
        accuracyCircleEntity.ellipse.semiMinorAxis = newAccuracy
    }
})

function transformArrayColorIntoCesiumColor(arrayColor) {
    return new Color(
        Color.byteToFloat(arrayColor[0]),
        Color.byteToFloat(arrayColor[1]),
        Color.byteToFloat(arrayColor[2]),
        arrayColor[3]
    )
}

function activateTracking() {
    const viewer = getViewer()
    if (viewer && geolocationPositionCartesian3.value) {
        accuracyCircleEntity = viewer.entities.add({
            id: 'geolocation-accuracy-circle',
            position: geolocationPositionCartesian3.value,
            ellipse: {
                semiMajorAxis: accuracy.value,
                semiMinorAxis: accuracy.value,
                material: transformArrayColorIntoCesiumColor(geolocationAccuracyCircleFillColor),
                heightReference: HeightReference.CLAMP_TO_TERRAIN,
            },
        })
        geolocationPositionEntity = viewer.entities.add({
            id: 'geolocation-position',
            position: geolocationPositionCartesian3.value,
            point: {
                pixelSize: geolocationPointWidth,
                color: transformArrayColorIntoCesiumColor(geolocationPointFillColor),
                outlineWidth: geolocationPointBorderWidth,
                outlineColor: transformArrayColorIntoCesiumColor(geolocationPointBorderColor),
                heightReference: HeightReference.CLAMP_TO_GROUND,
                // disable depth test so that the point isn't clipped or hidden by the terrain or buildings
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
        })
    }
}

function removeTracking() {
    const viewer = getViewer()
    if (viewer) {
        if (accuracyCircleEntity) {
            viewer.entities.removeById(accuracyCircleEntity.id)
            accuracyCircleEntity = null
        }
        if (geolocationPositionEntity) {
            viewer.entities.removeById(geolocationPositionEntity.id)
            geolocationPositionEntity = null
        }
    }
}
</script>

<template>
    <slot />
</template>