import type { DrawingStore } from '@/store/modules/drawing/types'
import type { ActionDispatcher } from '@/store/types'

export default function setIsDrawingEditShared(
    this: DrawingStore,
    isShared: boolean,
    dispatcher: ActionDispatcher
) {
    this.isDrawingEditShared = isShared
}
