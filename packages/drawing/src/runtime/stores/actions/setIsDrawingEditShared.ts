import type { DrawingStore, ActionDispatcher } from '~/types/drawingStore'

export default function setIsDrawingEditShared(
    this: DrawingStore,
    isShared: boolean,
    dispatcher: ActionDispatcher
) {
    this.isDrawingEditShared = isShared
}
