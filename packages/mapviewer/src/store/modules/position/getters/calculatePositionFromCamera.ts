import type { SingleCoordinate } from '@swissgeo/coordinates'

import { WGS84 } from '@swissgeo/coordinates'
import proj4 from 'proj4'

import type { CameraPosition, Position, PositionStore } from '@/store/modules/position/types'

import { calculateResolution } from '@/modules/map/components/cesium/utils/cameraUtils'
import { normalizeAngle } from '@/store/modules/position/utils/normalizeAngle'


export default function calculatePositionFromCamera(this: PositionStore): (width: number, camera: CameraPosition) => Position {
    return (width: number, camera: CameraPosition) => {

        const centerWGS84: SingleCoordinate = [camera.x, camera.y]

        const centerExpressedInWantedProjection = proj4<SingleCoordinate>(
            WGS84.epsg,
            this.projection.epsg,
            centerWGS84
        )

        const resolution = calculateResolution(camera.z, width)
        const zoom = this.projection.getZoomForResolution(
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
}