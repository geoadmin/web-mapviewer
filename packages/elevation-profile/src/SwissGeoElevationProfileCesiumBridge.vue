<script lang="ts" setup>
import type { SingleCoordinate, CoordinateSystem } from '@swissgeo/coordinates'
import type { Viewer } from 'cesium'
import type { Raw } from 'vue'

import { WEBMERCATOR, WGS84 } from '@swissgeo/coordinates'
import {
    CallbackPositionProperty,
    Cartesian3,
    Color,
    Ellipsoid,
    Entity,
    HeightReference,
} from 'cesium'
import proj4 from 'proj4'
import { computed, inject, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import type { GetPointBeingHoveredFunction } from '@/SwissGeoElevationProfilePlot.vue'

import { BORDER_COLOR, FILL_COLOR } from '@/config'

const { cesiumViewer, inputProjection = WEBMERCATOR } = defineProps<{
    cesiumViewer: Raw<Viewer>
    inputProjection?: CoordinateSystem
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
    position: new CallbackPositionProperty((): Cartesian3 => trackingPointPosition, false),
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
    cesiumViewer?.entities.add(trackingPoint)
}

function removeTrackingPoint() {
    pointAdded.value = false
    cesiumViewer?.entities.remove(trackingPoint)
}

function updatePosition() {
    if (coordinate.value) {
        const wgs84Position = proj4(inputProjection.epsg, WGS84.epsg, coordinate.value)
        Cartesian3.fromDegrees(
            wgs84Position[0],
            wgs84Position[1],
            0,
            Ellipsoid.WGS84,
            trackingPointPosition
        )
        cesiumViewer?.scene.requestRender()
    }
}
</script>

<template>
    <slot />
</template>
