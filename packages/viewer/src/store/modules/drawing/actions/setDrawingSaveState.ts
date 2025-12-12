import type { DrawingStore } from '@/store/modules/drawing/types'
import type { DrawingSaveState } from '@/store/modules/drawing/types'
import type { ActionDispatcher } from '@/store/types'

export default function setDrawingSaveState(
    this: DrawingStore,
    saveState: DrawingSaveState,
    dispatcher: ActionDispatcher
) {
    this.save.state = saveState
}
