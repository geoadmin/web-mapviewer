import type { DrawingStore, ActionDispatcher, DrawingSaveState } from '~/types/drawingStore'

export default function setDrawingSaveState(
    this: DrawingStore,
    saveState: DrawingSaveState,
    dispatcher: ActionDispatcher
) {
    this.save.state = saveState
}
