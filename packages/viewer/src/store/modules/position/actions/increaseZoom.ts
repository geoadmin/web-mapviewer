import { SwissCoordinateSystem } from '@swissgeo/coordinates'

import type { PositionStore } from '@/store/modules/position/types'
import type { ActionDispatcher } from '@/store/types'

export default function increaseZoom(this: PositionStore, dispatcher: ActionDispatcher): void {
    if (this.projection instanceof SwissCoordinateSystem) {
        // for Swiss coordinate system, there's an extra param to trigger normalization
        // (snapping to the closest rounded value)
        this.zoom = this.projection.roundZoomLevel(this.zoom, true) + 1
        return
    }
    this.zoom = this.projection.roundZoomLevel(this.zoom) + 1
}
