import type { MapStore } from '@/store/modules/map/types'
import type { ActionDispatcher } from '@/store/types'

export default function clearPinnedLocation(this: MapStore, dispatcher: ActionDispatcher): void {
    this.pinnedLocation = undefined
}
