import type { DebugStore } from '@/store/modules/debug/types/debug'
import type { ActionDispatcher } from '@/store/types'

export default function toggleShowTileDebugInfo(this: DebugStore, dispatcher: ActionDispatcher) {
    this.showTileDebugInfo = !this.showTileDebugInfo
}
