import type { DrawingStore } from '@/store/modules/drawing/types/drawing'
import type { ActionDispatcher } from '@/store/types'

import { EditMode } from '@/store/modules/drawing/types/EditMode.enum'

export default function setEditingMode(
    this: DrawingStore,
    mode: EditMode,
    reverseLineStringExtension: boolean,
    dispatcher: ActionDispatcher
) {
    this.edit.mode = mode
    if (mode !== EditMode.Extend) {
        this.edit.reverseLineStringExtension = false
    } else {
        this.edit.reverseLineStringExtension = reverseLineStringExtension
    }
}
