<script setup lang="ts">
import { LV95, WGS84 } from '@swissgeo/coordinates'
import log, { LogPreDefinedColor, type GeoadminLogInput } from '@swissgeo/log'
import { wrapDegrees } from '@swissgeo/numbers'
import { Cartesian2, Cartesian3, defined, Ellipsoid, Math as CesiumMath } from 'cesium'
import { isEqual } from 'lodash'
import proj4 from 'proj4'
import { computed, onBeforeUnmount, onMounted, watch } from 'vue'
import usePositionStore from '@/store/modules/position.store'
import type { ActionDispatcher } from '@/store/types'

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
import { getCesiumViewer } from '@/modules/map/components/cesium/utils/viewerUtils'

const dispatcher: ActionDispatcher = { name: 'CesiumCamera.vue' }

const positionStore = usePositionStore()
const cameraPosition = computed(() => positionStore.camera)

onMounted(() => {
    initCamera()
})

onBeforeUnmount(() => {
    const viewer = getCesiumViewer()
    if (viewer) {
        // the camera position that is for now dispatched to the store doesn't correspond where the 2D
        // view is looking at, as if the camera is tilted, its position will be over swaths of lands that
        // have nothing to do with the top-down 2D view.
        // here we ray trace the coordinate of where the camera is looking at, and send this "target"
        // to the store as the new center
        setCenterToCameraTarget()
    }
})

watch(cameraPosition, flyToPosition, {
    flush: 'post',
    deep: true,
})

function flyToPosition(): void {
    try {
        const viewer = getCesiumViewer()
        if (viewer && cameraPosition.value) {
            log.debug({
                title: 'TimeSlider.vue',
                titleColor: LogPreDefinedColor.Blue,
                message: [
                    'Cesium',
                    'Fly to camera position',
                    cameraPosition.value.x,
                    cameraPosition.value.y,
                    cameraPosition.value.z,
                ],
            })
            log.debug({
                title: 'TimeSlider.vue',
                titleColor: LogPreDefinedColor.Blue,
                message: [
                    'Cesium',
                    'With heading, pitch, roll',
                    cameraPosition.value.heading,
                    cameraPosition.value.pitch,
                    cameraPosition.value.roll,
                ],
            })
            viewer.camera.flyTo({
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
    } catch (error: unknown) {
        log.error({
            title: 'TimeSlider.vue',
            titleColor: LogPreDefinedColor.Red,
            message: ['Cesium', 'Error while moving the camera', error, cameraPosition.value],
        })
    }
}

function setCenterToCameraTarget(): void {
    const viewer = getCesiumViewer()
    if (!viewer) {
        return
    }
    const ray = viewer.camera.getPickRay(
        new Cartesian2(
            Math.round(viewer.scene.canvas.clientWidth / 2),
            Math.round(viewer.scene.canvas.clientHeight / 2)
        )
    )
    const cameraTarget = viewer.scene.globe.pick(ray!, viewer.scene)
    if (defined(cameraTarget)) {
        const cameraTargetCartographic = Ellipsoid.WGS84.cartesianToCartographic(cameraTarget)
        const lat = CesiumMath.toDegrees(cameraTargetCartographic.latitude)
        const lon = CesiumMath.toDegrees(cameraTargetCartographic.longitude)
        positionStore.setCenter(
            proj4(WGS84.epsg, positionStore.projection.epsg, [lon, lat]),
            dispatcher
        )
    }
}

function onCameraMoveEnd(): void {
    const viewer = getCesiumViewer()
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
        positionStore.setCameraPosition(newCameraPosition, dispatcher)
    }
}

function initCamera(): void {
    let viewer = getCesiumViewer()
    let destination
    let orientation
    if (cameraPosition.value) {
        // a camera position was already define in the URL, we use it
        log.debug({
            title: 'TimeSlider.vue',
            titleColor: LogPreDefinedColor.Blue,
            message: [
                'Cesium',
                'Existing camera position found at startup, using',
                cameraPosition.value,
            ],
        })
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
        log.debug({
            title: 'CesiumCamera.vue',
            titleColor: LogPreDefinedColor.Blue,
            message: [
                'Cesium',
                'No camera initial position defined, creating one using 2D coordinates',
            ],
        })
        destination = Cartesian3.fromDegrees(
            positionStore.centerEpsg4326[0],
            positionStore.centerEpsg4326[1],
            calculateHeight(positionStore.resolution, viewer?.canvas.clientWidth ?? 1024)
        )
        orientation = {
            heading: -CesiumMath.toRadians(positionStore.rotation),
            pitch: -CesiumMath.PI_OVER_TWO,
            roll: 0,
        }
    }

    if (!viewer) {
        viewer = getCesiumViewer()
        if (!viewer) {
            return
        }
    }
    const v = viewer
    const sscController = v.scene.screenSpaceCameraController
    sscController.minimumZoomDistance = CAMERA_MIN_ZOOM_DISTANCE
    sscController.maximumZoomDistance = CAMERA_MAX_ZOOM_DISTANCE

    v.scene.postRender.addEventListener(limitCameraCenter(LV95.getBoundsAs(WGS84)!.flatten))
    v.scene.postRender.addEventListener(
        limitCameraPitchRoll(CAMERA_MIN_PITCH, CAMERA_MAX_PITCH, 0.0, 0.0)
    )

    v.camera.flyTo({
        destination,
        orientation,
        duration: 0,
    })

    v.camera.moveEnd.addEventListener(onCameraMoveEnd)
}
</script>

<template>
    <slot />
</template>
