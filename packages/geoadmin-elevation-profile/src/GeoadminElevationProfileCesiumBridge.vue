<script lang="ts" setup>
import type { Viewer } from 'cesium'

import { type SingleCoordinate, WEBMERCATOR, WGS84 } from '@geoadmin/coordinates'
import { CallbackProperty, Cartesian3, Color, Ellipsoid, Entity, HeightReference } from 'cesium'
import proj4 from 'proj4'
import { computed, inject, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import type { GetPointBeingHoveredFunction } from '@/GeoadminElevationProfilePlot.vue'

import { BORDER_COLOR, FILL_COLOR } from '@/config'

const { cesiumInstance } = defineProps<{
    cesiumInstance: Viewer
}>()

const getPointBeingHovered = inject<GetPointBeingHoveredFunction>('getPointBeingHovered')

const coordinate = computed<SingleCoordinate | undefined>(() => {
    if (getPointBeingHovered) {
        return getPointBeingHovered()?.coordinate
    }
    return undefined
})

const trackingPointPosition: Cartesian3 = new Cartesian3()

const pointAdded = ref<boolean>(false)
const trackingPoint: Entity = new Entity({
    // @ts-expect-error https://github.com/CesiumGS/cesium/issues/8944
    position: new CallbackProperty((): Cartesian3 => trackingPointPosition, false),
    point: {
        show: true,
        color: Color.fromCssColorString(FILL_COLOR),
        outlineWidth: 5,
        outlineColor: Color.fromCssColorString(BORDER_COLOR),
        pixelSize: 15,
        heightReference: HeightReference.CLAMP_TO_GROUND,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
})

onMounted(() => {
    pointAdded.value = false
    if (coordinate.value) {
        updatePosition()
        addTrackingPoint()
    }
})

onBeforeUnmount(() => {
    removeTrackingPoint()
})

watch(coordinate, () => {
    if (coordinate.value) {
        updatePosition()
        if (!pointAdded.value) {
            addTrackingPoint()
        }
    } else {
        removeTrackingPoint()
    }
})

function addTrackingPoint() {
    pointAdded.value = true
    cesiumInstance?.entities.add(trackingPoint)
}

function removeTrackingPoint() {
    pointAdded.value = false
    cesiumInstance?.entities.remove(trackingPoint)
}

function updatePosition() {
    if (coordinate.value) {
        const wgs84Position = proj4(WEBMERCATOR.epsg, WGS84.epsg, coordinate.value)
        Cartesian3.fromDegrees(
            wgs84Position[0],
            wgs84Position[1],
            0,
            Ellipsoid.WGS84,
            trackingPointPosition
        )
        cesiumInstance?.scene.requestRender()
    }
}
</script>

<template>
    <slot />
</template>
