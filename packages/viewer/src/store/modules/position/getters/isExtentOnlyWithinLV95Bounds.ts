import { LV95 } from '@swissgeo/coordinates'

import type { PositionStore } from '@/store/modules/position/types/position'

export default function isExtentOnlyWithinLV95Bounds(this: PositionStore): boolean {
    const [currentExtentBottomLeft, currentExtentTopRight] = this.extent
    const lv95boundsInCurrentProjection = LV95.getBoundsAs(this.projection)
    return !!(
        lv95boundsInCurrentProjection?.isInBounds(
            currentExtentBottomLeft[0],
            currentExtentBottomLeft[1]
        ) &&
        lv95boundsInCurrentProjection?.isInBounds(
            currentExtentTopRight[0],
            currentExtentTopRight[1]
        )
    )
}
