import type { SingleCoordinate } from '@swissgeo/coordinates'

import type { MapStore } from '@/store/modules/map/types'
import type { ActionDispatcher } from '@/store/types'

export default function setPinnedLocation(
    this: MapStore,
    coordinates: SingleCoordinate | undefined,
    dispatcher: ActionDispatcher
): void {
    if (Array.isArray(coordinates) && coordinates.length === 2) {
        this.pinnedLocation = coordinates
    } else {
        this.pinnedLocation = undefined
    }
}
