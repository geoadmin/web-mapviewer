<script setup lang="ts">
import { LV95, WGS84 } from '@swissgeo/coordinates'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import { wrapDegrees } from '@swissgeo/numbers'
import { Cartesian2, Cartesian3, defined, Ellipsoid, Math as CesiumMath, type Viewer } from 'cesium'
import { isEqual } from 'lodash'
import proj4 from 'proj4'
import { computed, inject, onBeforeUnmount, onMounted, type ShallowRef, watch } from 'vue'

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
import usePositionStore from '@/store/modules/position'

const dispatcher: ActionDispatcher = { name: 'CesiumCamera.vue' }

const viewer = inject<ShallowRef<Viewer | undefined>>('viewer')
if (!viewer?.value) {
    log.error({
        title: 'CesiumCamera.vue',
        titleColor: LogPreDefinedColor.Red,
        messages: ['Viewer is not defined', 'CesiumCamera.vue: viewer cannot be initialized'],
    })
    throw new Error('CesiumCamera.vue: viewer is not defined')
}

const positionStore = usePositionStore()
const cameraPosition = computed(() => positionStore.camera)

onMounted(() => {
    initCamera()
})

onBeforeUnmount(() => {
    // the camera position that is for now dispatched to the store doesn't correspond where the 2D
    // view is looking at, as if the camera is tilted, its position will be over swaths of lands that
    // have nothing to do with the top-down 2D view.
    // here we ray trace the coordinate of where the camera is looking at, and send this "target"
    // to the store as the new center
    setCenterToCameraTarget()
})

watch(cameraPosition, flyToPosition, {
    flush: 'post',
    deep: true,
})

onMounted(() => {
    flyToPosition()
})

function flyToPosition(): void {
    try {
        if (viewer?.value && cameraPosition.value) {
            log.debug({
                title: 'CesiumCamera.vue',
                titleColor: LogPreDefinedColor.Blue,
                messages: [
                    'Fly to camera position',
                    cameraPosition.value.x,
                    cameraPosition.value.y,
                    cameraPosition.value.z,
                ],
            })
            log.debug({
                title: 'CesiumCamera.vue',
                titleColor: LogPreDefinedColor.Blue,
                messages: [
                    'With heading, pitch, roll',
                    cameraPosition.value.heading,
                    cameraPosition.value.pitch,
                    cameraPosition.value.roll,
                ],
            })
            viewer.value.camera.flyTo({
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
        log.error({
            title: 'CesiumCamera.vue',
            titleColor: LogPreDefinedColor.Red,
            messages: ['Error while moving the camera', error, cameraPosition.value],
        })
    }
}

function setCenterToCameraTarget(): void {
    if (!viewer?.value) {
        return
    }
    const ray = viewer.value.camera.getPickRay(
        new Cartesian2(
            Math.round(viewer.value.scene.canvas.clientWidth / 2),
            Math.round(viewer.value.scene.canvas.clientHeight / 2)
        )
    )
    if (!ray) {
        return
    }
    const cameraTarget = viewer.value.scene.globe.pick(ray, viewer.value.scene)
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
    if (!viewer?.value) {
        return
    }
    const camera = viewer.value.camera
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
    const viewerInstance = viewer?.value
    if (!viewerInstance) {
        return
    }
    let destination
    let orientation
    if (cameraPosition.value) {
        // a camera position was already define in the URL, we use it
        log.debug({
            title: 'CesiumCamera.vue',
            titleColor: LogPreDefinedColor.Blue,
            messages: ['Existing camera position found at startup, using', cameraPosition.value],
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
            messages: ['No camera initial position defined, creating one using 2D coordinates'],
        })
        destination = Cartesian3.fromDegrees(
            positionStore.centerEpsg4326[0],
            positionStore.centerEpsg4326[1],
            calculateHeight(positionStore.resolution, viewerInstance.canvas.clientWidth ?? 1024)
        )
        orientation = {
            heading: -CesiumMath.toRadians(positionStore.rotation),
            pitch: -CesiumMath.PI_OVER_TWO,
            roll: 0,
        }
    }

    const sscController = viewerInstance.scene.screenSpaceCameraController
    sscController.minimumZoomDistance = CAMERA_MIN_ZOOM_DISTANCE
    sscController.maximumZoomDistance = CAMERA_MAX_ZOOM_DISTANCE

    viewerInstance.scene.postRender.addEventListener(
        limitCameraCenter(LV95.getBoundsAs(WGS84)!.flatten)
    )
    viewerInstance.scene.postRender.addEventListener(
        limitCameraPitchRoll(CAMERA_MIN_PITCH, CAMERA_MAX_PITCH, 0.0, 0.0)
    )

    viewerInstance.camera.flyTo({
        destination,
        orientation,
        duration: 0,
    })

    viewerInstance.camera.moveEnd.addEventListener(onCameraMoveEnd)
}
</script>

<template>
    <slot />
</template>
