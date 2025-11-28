import type { DebugStore } from '@/store/modules/debug/types/debug'
import type { ActionDispatcher } from '@/store/types'

export default function toggleShowLayerExtents(this: DebugStore, dispatcher: ActionDispatcher) {
    this.showLayerExtents = !this.showLayerExtents
}
