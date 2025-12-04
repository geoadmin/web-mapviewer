import type { SingleCoordinate } from '@swissgeo/coordinates'

import type { CrossHair, PositionStore } from '@/store/modules/position/types'
import type { ActionDispatcher } from '@/store/types'

export default function setCrossHair(
    this: PositionStore,
    payload: {
        crossHair?: CrossHair
        crossHairPosition?: SingleCoordinate
    },
    dispatcher: ActionDispatcher
): void {
    const { crossHair, crossHairPosition } = payload
    if (!crossHair) {
        this.crossHair = undefined
        this.crossHairPosition = undefined
    } else {
        this.crossHair = crossHair
        // if a position is defined as param we use it
        // if no position was given, we use the current center of the map as crosshair position
        this.crossHairPosition = crossHairPosition ?? this.center
    }
}
