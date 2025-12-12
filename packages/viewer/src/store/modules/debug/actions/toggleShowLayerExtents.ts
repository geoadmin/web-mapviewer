import type { DebugStore } from '@/store/modules/debug/types'
import type { ActionDispatcher } from '@/store/types'

export default function toggleShowLayerExtents(this: DebugStore, dispatcher: ActionDispatcher) {
    this.showLayerExtents = !this.showLayerExtents
}
