import type { DrawingStore } from '@/store/modules/drawing/types/drawing'
import type { ActionDispatcher } from '@/store/types'

import { OnlineMode } from '@/store/modules/drawing/types/OnlineMode.enum'

export default function setOnlineMode(
    this: DrawingStore,
    onlineMode: OnlineMode,
    dispatcher: ActionDispatcher
) {
    this.onlineMode = onlineMode
}
