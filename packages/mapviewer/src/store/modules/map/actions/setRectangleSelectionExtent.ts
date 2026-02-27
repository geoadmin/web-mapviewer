import type { FlatExtent } from '@swissgeo/coordinates'

import type { MapStore } from '@/store/modules/map/types'
import type { ActionDispatcher } from '@/store/types'

export default function setRectangleSelectionExtent(
    this: MapStore,
    extent: FlatExtent | undefined,
    dispatcher: ActionDispatcher
): void {
    if (Array.isArray(extent) && extent.length === 4) {
        this.rectangleSelectionExtent = extent
    } else {
        this.rectangleSelectionExtent = undefined
    }
}
