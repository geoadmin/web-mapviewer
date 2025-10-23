import { wrapDegrees } from '@swissgeo/numbers'

import type { CameraPosition, PositionStore } from '@/store/modules/position/types/position'
import type { ActionDispatcher } from '@/store/types'

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
}
