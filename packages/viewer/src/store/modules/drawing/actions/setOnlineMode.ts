import type { OnlineMode, DrawingStore } from '@/store/modules/drawing/types'
import type { ActionDispatcher } from '@/store/types'

export default function setOnlineMode(
    this: DrawingStore,
    onlineMode: OnlineMode,
    dispatcher: ActionDispatcher
) {
    this.onlineMode = onlineMode
}
