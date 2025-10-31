<script setup lang="ts">
import { WGS84 } from '@swissgeo/coordinates'
import log from '@swissgeo/log'
import {
    Cartesian3,
    Color,
    ConstantPositionProperty,
    ConstantProperty,
    type Entity,
    HeightReference,
    type Viewer,
} from 'cesium'
import proj4 from 'proj4'
import { computed, inject, onMounted, type Ref, watch } from 'vue'

import useGeolocationStore from '@/store/modules/geolocation'
import usePositionStore from '@/store/modules/position'
import {
    geolocationAccuracyCircleFillColor,
    geolocationPointBorderColor,
    geolocationPointBorderWidth,
    geolocationPointFillColor,
    geolocationPointWidth,
} from '@/utils/styleUtils'

const viewer = inject<Ref<Viewer | undefined>>('viewer')
if (!viewer) {
    log.error({
        title: 'CesiumGeolocationFeedback.vue',
        message: ['Viewer not initialized, cannot create geolocation feedback'],
    })
    throw new Error('Viewer not initialized, cannot create geolocation feedback')
}

const positionStore = usePositionStore()
const geolocationStore = useGeolocationStore()
const geolocationActive = computed(() => geolocationStore.active)
const geolocationPosition = computed(() => geolocationStore.position)
const accuracy = computed(() => geolocationStore.accuracy)

const geolocationPositionCartesian3 = computed(() => {
    if (
        geolocationActive.value &&
        geolocationPosition.value &&
        // default value of the geolocation position in the store is [0,0], but giving that to
        // Cesium to calculate a Cartesian3 breaks its calculation process, so we guard against it
        geolocationPosition.value.some((coordinate) => coordinate !== 0)
    ) {
        const geolocationPositionWGS84 = proj4(
            positionStore.projection.epsg,
            WGS84.epsg,
            geolocationPosition.value
        )
        return Cartesian3.fromDegrees(geolocationPositionWGS84[0], geolocationPositionWGS84[1])
    }
    return undefined
})

let accuracyCircleEntity: Entity | undefined
let geolocationPositionEntity: Entity | undefined

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
            accuracyCircleEntity.position = new ConstantPositionProperty(newPosition)
            geolocationPositionEntity.position = new ConstantPositionProperty(newPosition)
        }
    }
})
watch(accuracy, (newAccuracy) => {
    if (accuracyCircleEntity?.ellipse) {
        accuracyCircleEntity.ellipse.semiMajorAxis = new ConstantProperty(newAccuracy)
        accuracyCircleEntity.ellipse.semiMinorAxis = new ConstantProperty(newAccuracy)
    }
})

function transformArrayColorIntoCesiumColor(arrayColor: number[]): Color {
    const rgba: [number, number, number, number] = [
        arrayColor[0] ?? 0,
        arrayColor[1] ?? 0,
        arrayColor[2] ?? 0,
        arrayColor[3] ?? 1,
    ]
    return new Color(
        Color.byteToFloat(rgba[0]),
        Color.byteToFloat(rgba[1]),
        Color.byteToFloat(rgba[2]),
        rgba[3]
    )
}

function activateTracking(): void {
    if (viewer && viewer.value && geolocationPositionCartesian3.value) {
        const viewerInstance = viewer.value
        accuracyCircleEntity = viewerInstance.entities.add({
            id: 'geolocation-accuracy-circle',
            position: geolocationPositionCartesian3.value,
            ellipse: {
                semiMajorAxis: accuracy.value,
                semiMinorAxis: accuracy.value,
                material: transformArrayColorIntoCesiumColor(geolocationAccuracyCircleFillColor),
                heightReference: HeightReference.CLAMP_TO_TERRAIN,
            },
        })
        geolocationPositionEntity = viewerInstance.entities.add({
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

function removeTracking(): void {
    if (viewer && viewer.value) {
        const viewerInstance = viewer.value
        if (accuracyCircleEntity) {
            viewerInstance.entities.removeById(accuracyCircleEntity.id)
            accuracyCircleEntity = undefined
        }
        if (geolocationPositionEntity) {
            viewerInstance.entities.removeById(geolocationPositionEntity.id)
            geolocationPositionEntity = undefined
        }
    }
}
</script>

<template>
    <slot />
</template>
