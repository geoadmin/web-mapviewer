import type { DrawingStore } from '@/store/modules/drawing/types'
import type { ActionDispatcher } from '@/store/types'

import useMapStore from '@/store/modules/map'

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
    this.overlay.show = typeof show === 'boolean' ? show : !this.overlay.show
    this.overlay.title = title
    this.online = typeof online === 'boolean' ? online : true
    this.layer.temporaryKmlId = kmlId
    if (this.overlay.show) {
        // when entering the drawing menu, we need to clear the location popup
        useMapStore().clearLocationPopupCoordinates(dispatcher)
    }
}
