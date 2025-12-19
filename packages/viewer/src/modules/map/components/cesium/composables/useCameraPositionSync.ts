import type { SingleCoordinate } from '@swissgeo/coordinates'

import { WGS84 } from '@swissgeo/coordinates'
import proj4 from 'proj4'

import type { CameraPosition } from '@/store/modules/position/types'

import { calculateResolution } from '@/modules/map/components/cesium/utils/cameraUtils'
import { normalizeAngle } from '@/store/modules/position/utils/normalizeAngle'
import usePositionStore from '@/store/modules/position'
import useUIStore from '@/store/modules/ui'

/**
 * Composable to calculate center, zoom, and rotation from a camera position
 */
export function useCameraPositionSync() {
    const positionStore = usePositionStore()
    const uiStore = useUIStore()

    /**
     * Calculate 2D position values (center, zoom, rotation) from a 3D camera position
     */
    function calculatePositionFromCamera(camera: CameraPosition) {
        const centerWGS84: SingleCoordinate = [camera.x, camera.y]

        const centerExpressedInWantedProjection = proj4<SingleCoordinate>(
            WGS84.epsg,
            positionStore.projection.epsg,
            centerWGS84
        )

        const resolution = calculateResolution(camera.z, uiStore.width)
        const zoom = positionStore.projection.getZoomForResolutionAndCenter(
            resolution,
            centerExpressedInWantedProjection
        )

        const rotation = normalizeAngle((camera.heading * Math.PI) / 180)

        return {
            center: centerExpressedInWantedProjection,
            zoom,
            rotation,
            resolution,
        }
    }

    return {
        calculatePositionFromCamera,
    }
}
