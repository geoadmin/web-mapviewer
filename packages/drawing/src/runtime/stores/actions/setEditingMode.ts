import type { DrawingStore, ActionDispatcher, EditMode } from '~/types/drawingStore'

export default function setEditingMode(
    this: DrawingStore,
    mode: EditMode,
    reverseLineStringExtension: boolean,
    dispatcher: ActionDispatcher
) {
    this.edit.mode = mode
    if (mode !== 'EXTEND') {
        this.edit.reverseLineStringExtension = false
    } else {
        this.edit.reverseLineStringExtension = reverseLineStringExtension
    }
}
