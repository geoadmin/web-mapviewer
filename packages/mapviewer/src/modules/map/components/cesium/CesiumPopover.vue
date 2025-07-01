<script lang="ts" setup>
/**
 * Places a popover on the cesium viewer at the given position (coordinates) and with the slot as
 * the content of the popover
 */

import type { SingleCoordinate } from '@geoadmin/coordinates'

import { CoordinateSystem, WGS84 } from '@geoadmin/coordinates'
import log, { LogPreDefinedColor } from '@geoadmin/log'
import { Cartesian3, Cartographic, defined, Ellipsoid, SceneTransforms, Viewer } from 'cesium'
import proj4 from 'proj4'
import { computed, inject, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue'

import MapPopover from '@/modules/map/components/MapPopover.vue'

const {
    coordinates,
    projection,
    authorizePrint = false,
    title = '',
    useContentPadding = false,
} = defineProps<{
    coordinates: SingleCoordinate
    projection: CoordinateSystem
    authorizePrint?: boolean
    title?: string
    useContentPadding?: boolean
}>()

const emits = defineEmits<{
    close: [void]
}>()

const getViewer = inject<() => Viewer | undefined>('getViewer')

// Cesium will create an instance of Cartesian3 or Cartographic each time a calculation is made if
// we do not provide one, so here we declare two "buffer" instances that will be used throughout this component
const tempCartesian3 = new Cartesian3()
const tempCartographic = new Cartographic()

const popoverAnchor = useTemplateRef<InstanceType<typeof MapPopover>>('popoverAnchor')

const anchorPosition = ref<{ top: number; left: number }>({
    top: 0,
    left: 0,
})
const coordinatesHeight = ref<number | undefined>()

const wgs84Coordinates = computed<SingleCoordinate>(() =>
    proj4(projection.epsg, WGS84.epsg, coordinates)
)

onMounted(() => {
    if (!getViewer) {
        log.error({
            title: 'CesiumPopover',
            titleStyle: {
                backgroundColor: LogPreDefinedColor.Teal,
            },
            messages: [
                'CesiumPopover could not be mounted because the getViewer function is not defined',
            ],
        })
        return
    }
    const viewer = getViewer()
    if (viewer) {
        // By default, the `camera.changed` event will trigger when the camera has changed by 50%
        // To make it more sensitive (and improve tooltip "tracking" on the map), we set down sensitivity to 0.1%
        // meaning that a change of 0.1% in any direction/rotation axis of the camera will trigger a change event
        viewer.camera.percentageChanged = 0.001
        viewer.camera.changed.addEventListener(updatePosition)

        // if the user zooms in (or out) we want to be sure that the new loaded terrain
        // is taken into account for the tooltip positioning
        viewer.scene.globe.tileLoadProgressEvent.addEventListener(onTileLoadProgress)
        // Implementing something similar to the sandcastle found on https://github.com/CesiumGS/cesium/issues/3247#issuecomment-1533505387
        // but taking into account height using globe.getHeight for the given coordinate
        // without taking height into account.
        // The anchor for the tooltip will be the virtual bottom of the map (at sea level), rendering poorly as
        // there will be a gap between the tooltip and the selected feature
        updateCoordinateHeight()
        updatePosition()
    } else {
        log.error({
            title: 'CesiumPopover',
            titleStyle: {
                backgroundColor: LogPreDefinedColor.Teal,
            },
            messages: ['Cesium viewer unavailable, could not hook up popover to Cesium'],
        })
    }
})
onUnmounted(() => {
    if (!getViewer) {
        return
    }
    const viewer = getViewer()
    if (viewer) {
        viewer.camera.changed.removeEventListener(updatePosition)
        viewer.scene.globe.tileLoadProgressEvent.removeEventListener(onTileLoadProgress)
        // Set back the camera change sensitivity to default value (see mounted())
        viewer.camera.percentageChanged = 0.5
    }
})

watch(
    () => coordinates,
    () => {
        updateCoordinateHeight()
        updatePosition()
    }
)

/**
 * Grabs the height on the terrain (no backend request) for the given coordinates and stores it in
 * this.coordinatesHeight
 */
function updateCoordinateHeight() {
    if (!getViewer) {
        return
    }
    coordinatesHeight.value = getViewer()?.scene.globe.getHeight(
        Cartographic.fromDegrees(
            wgs84Coordinates.value[0],
            wgs84Coordinates.value[1],
            0,
            tempCartographic
        )
    )
}

function updatePosition() {
    if (!coordinates?.length || !getViewer || !getViewer()) {
        emits('close')
        return
    }
    const viewer = getViewer()
    const cartesianCoords = SceneTransforms.worldToWindowCoordinates(
        viewer.scene,
        Cartesian3.fromDegrees(
            wgs84Coordinates.value[0],
            wgs84Coordinates.value[1],
            coordinatesHeight.value,
            Ellipsoid.WGS84,
            tempCartesian3
        )
    )
    if (defined(cartesianCoords) && popoverAnchor.value) {
        anchorPosition.value.left = cartesianCoords.x - popoverAnchor.value.width / 2
        // adding 15px to the top so that the tip of the arrow of the tooltip is on the edge
        // of the highlighting circle of the selected feature
        anchorPosition.value.top = cartesianCoords.y + 15
    }
}

function onTileLoadProgress() {
    if (!getViewer) {
        return
    }
    const viewer = getViewer()
    // recalculating height and position as soon as all new terrain tiles are loaded (after camera movement, or at init)
    if (viewer?.scene?.globe?.tilesLoaded) {
        updateCoordinateHeight()
        updatePosition()
    }
}

function onClose() {
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
