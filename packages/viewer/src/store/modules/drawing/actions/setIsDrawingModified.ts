import type { DrawingStore } from '@/store/modules/drawing/types/drawing'
import type { ActionDispatcher } from '@/store/types'

export default function setIsDrawingModified(
    this: DrawingStore,
    isModified: boolean,
    dispatcher: ActionDispatcher
) {
    this.isDrawingModified = isModified
}
