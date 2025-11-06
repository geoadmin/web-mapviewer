import type { SingleCoordinate } from '@swissgeo/coordinates'

import type { MapStore } from '@/store/modules/map/types/map'
import type { ActionDispatcher } from '@/store/types'

export default function setPinnedLocation(
    this: MapStore,
    coordinates: SingleCoordinate | undefined,
    dispatcher: ActionDispatcher
): void {
    console.log('Setting pinned location to', coordinates)
    if (Array.isArray(coordinates) && coordinates.length === 2) {
        this.pinnedLocation = coordinates
    } else {
        this.pinnedLocation = undefined
    }
    console.log('Pinned location is now', this.pinnedLocation)
}
