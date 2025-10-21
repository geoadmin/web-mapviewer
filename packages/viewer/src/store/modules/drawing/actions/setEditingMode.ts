import type { DrawingStore } from '@/store/modules/drawing/types/drawing'
import type { ActionDispatcher } from '@/store/types'

import { EditMode } from '@/store/modules/drawing/types/EditMode.enum'

export default function setEditingMode(
    this: DrawingStore,
    mode: EditMode,
    reverseLineStringExtension: boolean,
    dispatcher: ActionDispatcher
) {
    this.editingMode = mode
    if (mode !== EditMode.EXTEND) {
        this.reverseLineStringExtension = false
    } else {
        this.reverseLineStringExtension = reverseLineStringExtension
    }
}
