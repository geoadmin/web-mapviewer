<script setup>
import { Cartesian2, Cartesian3, defined, Ellipsoid, Math as CesiumMath } from 'cesium'
import { isEqual } from 'lodash'
import proj4 from 'proj4'
import { computed, inject, onBeforeUnmount, onMounted, watch } from 'vue'
import { useStore } from 'vuex'

import {
    CAMERA_MAX_PITCH,
    CAMERA_MAX_ZOOM_DISTANCE,
    CAMERA_MIN_PITCH,
    CAMERA_MIN_ZOOM_DISTANCE,
} from '@/config/cesium.config'
import {
    calculateHeight,
    limitCameraCenter,
    limitCameraPitchRoll,
} from '@/modules/map/components/cesium/utils/cameraUtils'
import { LV95, WGS84 } from '@/utils/coordinates/coordinateSystems'
import log from '@/utils/logging'
import { wrapDegrees } from '@/utils/numberUtils'

const dispatcher = {
    dispatcher: 'useCesiumCamera.composable',
}

const getViewer = inject('getViewer')

const store = useStore()
const cameraPosition = computed(() => store.state.position.camera)

onMounted(() => {
    initCamera()
})
onBeforeUnmount(() => {
    const viewer = getViewer()
    if (viewer) {
        // the camera position that is for now dispatched to the store doesn't correspond where the 2D
        // view is looking at, as if the camera is tilted, its position will be over swaths of lands that
        // have nothing to do with the top-down 2D view.
        // here we ray trace the coordinate of where the camera is looking at, and send this "target"
        // to the store as the new center
        setCenterToCameraTarget(viewer, store)
    }
})

watch(cameraPosition, flyToPosition, {
    flush: 'post',
    deep: true,
})

function flyToPosition() {
    try {
        if (getViewer()) {
            log.debug(
                `[Cesium] Fly to camera position ${cameraPosition.value.x}, ${cameraPosition.value.y}, ${cameraPosition.value.z}`
            )
            getViewer().camera.flyTo({
                destination: Cartesian3.fromDegrees(
                    cameraPosition.value.x,
                    cameraPosition.value.y,
                    cameraPosition.value.z
                ),
                orientation: {
                    heading: CesiumMath.toRadians(cameraPosition.value.heading),
                    pitch: CesiumMath.toRadians(cameraPosition.value.pitch),
                    roll: CesiumMath.toRadians(cameraPosition.value.roll),
                },
                duration: 1,
            })
        }
    } catch (error) {
        log.error('[Cesium] Error while moving the camera', error, cameraPosition.value)
    }
}

function setCenterToCameraTarget() {
    const viewer = getViewer()
    if (!viewer) {
        return
    }
    const ray = viewer.camera.getPickRay(
        new Cartesian2(
            Math.round(viewer.scene.canvas.clientWidth / 2),
            Math.round(viewer.scene.canvas.clientHeight / 2)
        )
    )
    const cameraTarget = viewer.scene.globe.pick(ray, viewer.scene)
    if (defined(cameraTarget)) {
        const cameraTargetCartographic = Ellipsoid.WGS84.cartesianToCartographic(cameraTarget)
        const lat = CesiumMath.toDegrees(cameraTargetCartographic.latitude)
        const lon = CesiumMath.toDegrees(cameraTargetCartographic.longitude)
        store.dispatch('setCenter', {
            center: proj4(WGS84.epsg, store.state.position.projection.epsg, [lon, lat]),
            ...dispatcher,
        })
    }
}

function onCameraMoveEnd() {
    const viewer = getViewer()
    if (!viewer) {
        return
    }
    const camera = viewer.camera
    const position = camera.positionCartographic
    const newCameraPosition = {
        x: parseFloat(CesiumMath.toDegrees(position.longitude).toFixed(6)),
        y: parseFloat(CesiumMath.toDegrees(position.latitude).toFixed(6)),
        z: parseFloat(position.height.toFixed(1)),
        // Wrap degrees, cesium might return 360, which is internally wrapped to 0 in store.
        heading: wrapDegrees(parseFloat(CesiumMath.toDegrees(camera.heading).toFixed(0))),
        pitch: wrapDegrees(parseFloat(CesiumMath.toDegrees(camera.pitch).toFixed(0))),
        roll: wrapDegrees(parseFloat(CesiumMath.toDegrees(camera.roll).toFixed(0))),
    }
    if (!isEqual(newCameraPosition, cameraPosition.value)) {
        store.dispatch('setCameraPosition', {
            position: newCameraPosition,
            ...dispatcher,
        })
    }
}

function initCamera() {
    const viewer = getViewer()
    let destination
    let orientation
    if (cameraPosition.value) {
        // a camera position was already define in the URL, we use it
        log.debug('[Cesium] Existing camera position found at startup, using', cameraPosition.value)
        destination = Cartesian3.fromDegrees(
            cameraPosition.value.x,
            cameraPosition.value.y,
            cameraPosition.value.z
        )
        orientation = {
            heading: CesiumMath.toRadians(cameraPosition.value.heading),
            pitch: CesiumMath.toRadians(cameraPosition.value.pitch),
            roll: CesiumMath.toRadians(cameraPosition.value.roll),
        }
    } else {
        // no camera position was ever calculated, so we create one using the 2D coordinates
        log.debug(
            '[Cesium] No camera initial position defined, creating one using 2D coordinates',
            store.getters.centerEpsg4326
        )
        destination = Cartesian3.fromDegrees(
            store.getters.centerEpsg4326[0],
            store.getters.centerEpsg4326[1],
            calculateHeight(store.getters.resolution, viewer.canvas.clientWidth)
        )
        orientation = {
            heading: -CesiumMath.toRadians(store.state.position.rotation),
            pitch: -CesiumMath.PI_OVER_TWO,
            roll: 0,
        }
    }

    const sscController = viewer.scene.screenSpaceCameraController
    sscController.minimumZoomDistance = CAMERA_MIN_ZOOM_DISTANCE
    sscController.maximumZoomDistance = CAMERA_MAX_ZOOM_DISTANCE

    viewer.scene.postRender.addEventListener(limitCameraCenter(LV95.getBoundsAs(WGS84).flatten))
    viewer.scene.postRender.addEventListener(
        limitCameraPitchRoll(CAMERA_MIN_PITCH, CAMERA_MAX_PITCH, 0.0, 0.0)
    )

    viewer.camera.flyTo({
        destination,
        orientation,
        duration: 0,
    })

    viewer.camera.moveEnd.addEventListener(onCameraMoveEnd)
}
</script>

<template>
    <slot />
</template>
