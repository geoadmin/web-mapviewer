import { wrapDegrees } from '@swissgeo/numbers'

import type { CameraPosition, PositionStore } from '@/store/modules/position/types'
import type { ActionDispatcher } from '@/store/types'

import { useCameraPositionSync } from '@/modules/map/components/cesium/composables/useCameraPositionSync'
import useCesiumStore from '@/store/modules/cesium'

export default function setCameraPosition(
    this: PositionStore,
    position: CameraPosition | undefined,
    dispatcher: ActionDispatcher
): void {
    // position can be null (in 2d mode), we do not wrap it in this case
    this.camera = position
        ? {
            x: position.x,
            y: position.y,
            z: position.z,
            // wrapping all angle-based values so that they do not exceed a full-circle value
            roll: wrapDegrees(position.roll),
            pitch: wrapDegrees(position.pitch),
            heading: wrapDegrees(position.heading),
        }
        : undefined
    if (this.camera) {
        // Prevent recursion: don't call setCenter and setZoom which would call back setCameraPosition
        const cesiumStore = useCesiumStore()

        if (cesiumStore.active) {
            return
        }
        // updating the 2D position with the new camera values
        const { calculatePositionFromCamera } = useCameraPositionSync()
        const { center, zoom, rotation } = calculatePositionFromCamera(this.camera)
        this.setCenter(center, dispatcher)
        this.setZoom(zoom, dispatcher)
        this.setRotation(rotation, dispatcher)
    }
}
