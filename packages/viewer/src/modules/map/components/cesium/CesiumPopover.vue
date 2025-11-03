<script setup lang="ts">
/**
 * Places a popover on the cesium viewer at the given position (coordinates) and with the slot as
 * the content of the popover
 */

import type { SingleCoordinate } from '@swissgeo/coordinates'

import { CoordinateSystem, WGS84 } from '@swissgeo/coordinates'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import { Cartesian3, Cartographic, defined, Ellipsoid, SceneTransforms, type Viewer } from 'cesium'
import proj4 from 'proj4'
import {
    computed,
    inject,
    onMounted,
    onUnmounted,
    ref,
    type ShallowRef,
    useTemplateRef,
    watch,
} from 'vue'

import MapPopover from '@/modules/map/components/MapPopover.vue'

const { coordinates, projection, authorizePrint, title, useContentPadding } = defineProps<{
    coordinates: SingleCoordinate
    projection: CoordinateSystem
    authorizePrint?: boolean
    title?: string
    useContentPadding?: boolean
}>()

const emits = defineEmits<{
    close: [void]
}>()

const viewer = inject<ShallowRef<Viewer | undefined>>('viewer')
if (!viewer?.value) {
    log.error({
        title: 'CesiumPopover.vue',
        titleColor: LogPreDefinedColor.Red,
        messages: ['Cesium viewer unavailable, could not hook up popover to Cesium'],
    })
    throw new Error('CesiumPopover.vue: viewer is not defined')
}

// Cesium will create an instance of Cartesian3 or Cartographic each time a calculation is made if
// we do not provide one, so here we declare two "buffer" instances that will be used throughout this component
const tempCartesian3 = new Cartesian3()
const tempCartographic = new Cartographic()

const popoverAnchor = useTemplateRef('popoverAnchor')

const anchorPosition = ref({
    top: 0,
    left: 0,
})
const coordinatesHeight = ref<number | undefined>()

const wgs84Coordinates = computed(() => proj4(projection.epsg, WGS84.epsg, coordinates))

onMounted(() => {
    if (viewer?.value) {
        // By default, the `camera.changed` event will trigger when the camera has changed by 50%
        // To make it more sensitive (and improve tooltip "tracking" on the map), we set down sensitivity to 0.1%
        // meaning that a change of 0.1% in any direction/rotation axis of the camera will trigger a change event
        viewer.value.camera.percentageChanged = 0.001
        viewer.value.camera.changed.addEventListener(updatePosition)

        // if the user zooms in (or out) we want to be sure that the new loaded terrain
        // is taken into account for the tooltip positioning
        viewer.value.scene.globe.tileLoadProgressEvent.addEventListener(onTileLoadProgress)
        // implementing something similar to the sandcastle found on https://github.com/CesiumGS/cesium/issues/3247#issuecomment-1533505387
        // but taking into account height using globe.getHeight for the given coordinate
        // without taking height into account, the anchor for the tooltip will be the virtual bottom of the map (at sea level), rendering poorly as
        // there will be a gap between the tooltip and the selected feature
        updateCoordinateHeight()
        updatePosition()
    }
})

onUnmounted(() => {
    if (!viewer?.value) {
        return
    }
    viewer.value.camera.changed.removeEventListener(updatePosition)
    viewer.value.scene.globe.tileLoadProgressEvent.removeEventListener(onTileLoadProgress)
    // Set back the camera change sensitivity to default value (see mounted())
    viewer.value.camera.percentageChanged = 0.5
})

watch(
    () => coordinates,
    () => {
        updateCoordinateHeight()
        updatePosition()
    }
)

/**
 * Grabs the height on the terrain (no backend request) for the given coordinates, and stores it in
 * this.coordinatesHeight
 */
function updateCoordinateHeight(): void {
    coordinatesHeight.value =
        viewer?.value?.scene.globe.getHeight(
            Cartographic.fromDegrees(
                wgs84Coordinates.value[0],
                wgs84Coordinates.value[1],
                0,
                tempCartographic
            )
        ) ?? 0
}

function updatePosition(): void {
    if (!coordinates?.length) {
        emits('close')
        return
    }
    if (!viewer?.value) {
        return
    }
    const cartesianCoords = SceneTransforms.worldToWindowCoordinates(
        viewer.value.scene,
        Cartesian3.fromDegrees(
            wgs84Coordinates.value[0],
            wgs84Coordinates.value[1],
            coordinatesHeight.value ?? 0,
            Ellipsoid.WGS84,
            tempCartesian3
        )
    )
    if (defined(cartesianCoords) && popoverAnchor.value && popoverAnchor.value.width) {
        anchorPosition.value.left = cartesianCoords.x - popoverAnchor.value.width / 2
        // adding 15px to the top so that the tip of the arrow of the tooltip is on the edge
        // of the highlighting circle of the selected feature
        anchorPosition.value.top = cartesianCoords.y + 15
    }
}

function onTileLoadProgress(): void {
    // recalculating height and position as soon as all new terrain tiles are loaded (after camera movement, or at init)
    if (viewer?.value && viewer.value.scene.globe.tilesLoaded) {
        updateCoordinateHeight()
        updatePosition()
    }
}

function onClose(): void {
    emits('close')
}
</script>

<template>
    <MapPopover
        ref="popoverAnchor"
        :authorize-print="authorizePrint"
        :title="title"
        :use-content-padding="useContentPadding"
        :anchor-position="anchorPosition"
        @close="onClose"
    >
        <template #extra-buttons>
            <slot name="extra-buttons" />
        </template>
        <slot />
    </MapPopover>
</template>
