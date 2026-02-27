import type { DebugStore } from '@/store/modules/debug/types'
import type { ActionDispatcher } from '@/store/types'

export default function toggleShowTileDebugInfo(this: DebugStore, dispatcher: ActionDispatcher) {
    this.showTileDebugInfo = !this.showTileDebugInfo
}
