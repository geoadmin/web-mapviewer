import type { DrawingStore } from '@/store/modules/drawing/types/drawing'
import type { ActionDispatcher } from '@/store/types'

import useMapStore from '@/store/modules/map.store'

interface ToggleDrawingOverlayPayload {
    show?: boolean
    online?: boolean
    kmlId?: string
    title?: string
}

export default function toggleDrawingOverlay(
    this: DrawingStore,
    payload: ToggleDrawingOverlayPayload,
    dispatcher: ActionDispatcher
) {
    const { show, online, kmlId, title = 'draw_mode_title' } = payload
    this.drawingOverlay.show = typeof show === 'boolean' ? show : !this.drawingOverlay.show
    this.drawingOverlay.title = title
    this.online = typeof online === 'boolean' ? online : true
    this.temporaryKmlId = kmlId
    if (this.drawingOverlay.show) {
        // when entering the drawing menu, we need to clear the location popup
        useMapStore().clearLocationPopupCoordinates(dispatcher)
    }
}
