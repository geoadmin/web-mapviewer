import type { MapStore } from '@/store/modules/map/types/map'
import type { ActionDispatcher } from '@/store/types'

export default function setMapHasBeenLoaded(this: MapStore, dispatcher: ActionDispatcher) {
    this.hasBeenLoaded = true
}
