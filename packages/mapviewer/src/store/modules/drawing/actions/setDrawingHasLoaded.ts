import type { DrawingStore } from '@/store/modules/drawing/types'
import type { ActionDispatcher } from '@/store/types'

export default function setDrawingHasLoaded(
    this: DrawingStore,
    hasLoaded: boolean,
    dispatcher: ActionDispatcher
) {
    this.layer.hasLoaded = hasLoaded
}
