import type { SingleCoordinate } from '@swissgeo/coordinates'

import type { PositionStore } from '@/store/modules/position/types/position'
import type { ActionDispatcher } from '@/store/types'

import { CrossHairs } from '@/store/modules/position/types/crossHairs.enum'

export default function setCrossHair(
    this: PositionStore,
    payload: {
        crossHair?: CrossHairs
        crossHairPosition?: SingleCoordinate
    },
    dispatcher: ActionDispatcher
): void {
    const { crossHair, crossHairPosition } = payload
    if (!crossHair) {
        this.crossHair = undefined
        this.crossHairPosition = undefined
    } else if (Object.values(CrossHairs).includes(crossHair)) {
        // Use Object.values().includes() to check if the crosshair is a valid enum value
        // (e.g., 'point', 'cross', etc.) rather than checking if it's an enum key
        this.crossHair = crossHair
        // if a position is defined as param we use it
        // if no position was given, we use the current center of the map as crosshair position
        this.crossHairPosition = crossHairPosition ?? this.center
    }
}
