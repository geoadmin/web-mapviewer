<script setup>
/**
 * Places a popover on the cesium viewer at the given position (coordinates) and with the slot as
 * the content of the popover
 */

import { Cartesian3, Cartographic, defined, Ellipsoid, SceneTransforms } from 'cesium'
import proj4 from 'proj4'
import { computed, inject, onBeforeUnmount, onMounted, ref, toRefs, watch } from 'vue'

import MapPopover from '@/modules/map/components/MapPopover.vue'
import CoordinateSystem from '@/utils/coordinates/CoordinateSystem.class'
import { WGS84 } from '@/utils/coordinates/coordinateSystems'

const props = defineProps({
    coordinates: {
        type: Array,
        required: true,
    },
    projection: {
        type: CoordinateSystem,
        required: true,
    },
    authorizePrint: {
        type: Boolean,
        default: false,
    },
    title: {
        type: String,
        default: '',
    },
    useContentPadding: {
        type: Boolean,
        default: false,
    },
})
const { coordinates, projection, authorizePrint, title, useContentPadding } = toRefs(props)

const emits = defineEmits(['close'])

const getViewer = inject('getViewer')

const popoverAnchor = ref(null)
const anchorPosition = ref({
    top: 0,
    left: 0,
})
const coordinatesHeight = ref(null)

const wgs84Coordinates = computed(() => proj4(projection.value.epsg, WGS84.epsg, coordinates.value))

onMounted(() => {
    const viewer = getViewer()
    // By default, the `camera.changed` event will trigger when the camera has changed by 50%
    // To make it more sensitive (and improve tooltip "tracking" on the map), we set down sensitivity to 0.1%
    // meaning that a change of 0.1% in any direction/rotation axis of the camera will trigger a change event
    viewer.camera.percentageChanged = 0.001
    viewer.camera.changed.addEventListener(updatePosition)

    // if the user zooms in (or out) we want to be sure that the new loaded terrain
    // is taken into account for the tooltip positioning
    viewer.scene.globe.tileLoadProgressEvent.addEventListener(onTileLoadProgress)
    // implementing something similar to the sandcastle found on https://github.com/CesiumGS/cesium/issues/3247#issuecomment-1533505387
    // but taking into account height using globe.getHeight for the given coordinate
    // without taking height into account, the anchor for the tooltip will be the virtual bottom of the map (at sea level), rendering poorly as
    // there will be a gap between the tooltip and the selected feature
    updateCoordinateHeight()
    updatePosition()
})
onBeforeUnmount(() => {
    const viewer = getViewer()
    if (viewer) {
        viewer.camera.changed.removeEventListener(updatePosition)
        viewer.scene.globe.tileLoadProgressEvent.removeEventListener(onTileLoadProgress)
        // Set back the camera change sensitivity to default value (see mounted())
        viewer.camera.percentageChanged = 0.5
    }
})

watch(coordinates, () => {
    updateCoordinateHeight()
    updatePosition()
})

function updatePosition() {
    if (!coordinates.value?.length) {
        emits('close')
        return
    }
    const cartesianCoords = SceneTransforms.worldToWindowCoordinates(
        getViewer().scene,
        Cartesian3.fromDegrees(
            wgs84Coordinates.value[0],
            wgs84Coordinates.value[1],
            coordinatesHeight.value,
            Ellipsoid.WGS84
        )
    )
    if (defined(cartesianCoords) && popoverAnchor.value?.size) {
        anchorPosition.value.left = cartesianCoords.x - popoverAnchor.value.size.width / 2
        // adding 15px to the top so that the tip of the arrow of the tooltip is on the edge
        // of the highlighting circle of the selected feature
        anchorPosition.value.top = cartesianCoords.y + 15
    }
}
/**
 * Grabs the height on the terrain (no backend request) for the given coordinates, and stores it in
 * this.coordinatesHeight
 */
function updateCoordinateHeight() {
    coordinatesHeight.value = getViewer()?.scene.globe.getHeight(
        Cartographic.fromDegrees(wgs84Coordinates.value[0], wgs84Coordinates.value[1])
    )
}

function onTileLoadProgress() {
    // recalculating height and position as soon as all new terrain tiles are loaded (after camera movement, or at init)
    if (getViewer().scene.globe.tilesLoaded) {
        updateCoordinateHeight()
        updatePosition()
    }
}
</script>
<template>
    <MapPopover
        ref="popoverAnchor"
        :authorize-print="authorizePrint"
        :title="title"
        :use-content-padding="useContentPadding"
        :anchor-position="anchorPosition"
        @close="emits('close')"
    >
        <template #extra-buttons>
            <slot name="extra-buttons" />
        </template>
        <slot />
    </MapPopover>
</template>
