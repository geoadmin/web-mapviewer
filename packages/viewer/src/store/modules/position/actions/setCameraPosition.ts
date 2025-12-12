import type { SingleCoordinate } from '@swissgeo/coordinates'

import { WGS84 } from '@swissgeo/coordinates'
import { wrapDegrees } from '@swissgeo/numbers'
import proj4 from 'proj4'

import type { CameraPosition, PositionStore } from '@/store/modules/position/types'
import type { ActionDispatcher } from '@/store/types'

import { calculateResolution } from '@/modules/map/components/cesium/utils/cameraUtils'
import useCesiumStore from '@/store/modules/cesium'
import { normalizeAngle } from '@/store/modules/position/utils/normalizeAngle'
import useUIStore from '@/store/modules/ui'

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
        // updating the 2D position with the new camera values
        const uiStore = useUIStore()

        const centerWGS84: SingleCoordinate = [this.camera.x, this.camera.y]

        const centerExpressedInWantedProjection = proj4<SingleCoordinate>(
            WGS84.epsg,
            this.projection.epsg,
            centerWGS84
        )

        const resolution = calculateResolution(this.camera.z, uiStore.width)
        const zoom = this.projection.getZoomForResolutionAndCenter(
            resolution,
            centerExpressedInWantedProjection
        )

        // Prevent recursion: don't call setCenter and setZoom which would call back setCameraPosition
        const cesiumStore = useCesiumStore()
        if (cesiumStore.active) {
            return
        }
        this.setCenter(centerExpressedInWantedProjection, dispatcher)
        this.setZoom(zoom, dispatcher)
        this.setRotation(normalizeAngle((this.camera.heading * Math.PI) / 180), dispatcher)
    }
}
