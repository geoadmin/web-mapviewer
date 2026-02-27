import type { DrawingStore, ActionDispatcher } from '~/types/drawingStore'

export default function setDrawingName(
    this: DrawingStore,
    name: string,
    dispatcher: ActionDispatcher
) {
    this.name = name
}
