import type { DrawingStore, EditMode } from '@/store/modules/drawing/types'
import type { ActionDispatcher } from '@/store/types'

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
