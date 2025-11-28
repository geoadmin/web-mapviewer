import type { DrawingStore } from '@/store/modules/drawing/types/drawing'
import type { DrawingSaveState } from '@/store/modules/drawing/types/DrawingSaveState.enum'
import type { ActionDispatcher } from '@/store/types'

export default function setDrawingSaveState(
    this: DrawingStore,
    saveState: DrawingSaveState,
    dispatcher: ActionDispatcher
) {
    this.save.state = saveState
}
