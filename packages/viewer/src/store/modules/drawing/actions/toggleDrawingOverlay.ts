import type { DrawingStore } from '@/store/modules/drawing/types/drawing'
import type { ActionDispatcher } from '@/store/types'

import useMapStore from '@/store/modules/map.store'

interface ToggleDrawingOverlayOptions {
    show?: boolean
    online?: boolean
    kmlId?: string
    title?: string
}

export default function toggleDrawingOverlay(this: DrawingStore, dispatcher: ActionDispatcher): void
export default function toggleDrawingOverlay(
    this: DrawingStore,
    options: ToggleDrawingOverlayOptions,
    dispatcher: ActionDispatcher
): void

export default function toggleDrawingOverlay(
    this: DrawingStore,
    optionsOrDispatcher: ToggleDrawingOverlayOptions | ActionDispatcher,
    dispatcherOrNothing?: ActionDispatcher
) {
    const options = !dispatcherOrNothing ? (optionsOrDispatcher as ToggleDrawingOverlayOptions) : {}
    const dispatcher = dispatcherOrNothing
        ? dispatcherOrNothing
        : (optionsOrDispatcher as ActionDispatcher)

    const { show, online, kmlId, title = 'draw_mode_title' } = options
    this.drawingOverlay.show = typeof show === 'boolean' ? show : !this.drawingOverlay.show
    this.drawingOverlay.title = title
    this.online = typeof online === 'boolean' ? online : true
    this.temporaryKmlId = kmlId
    if (this.drawingOverlay.show) {
        // when entering the drawing menu, we need to clear the location popup
        useMapStore().clearLocationPopupCoordinates(dispatcher)
    }
}
