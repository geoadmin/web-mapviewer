import type { MapStore } from '@/store/modules/map/types/map'
import type { ActionDispatcher } from '@/store/types'

export default function clearLocationPopupCoordinates(
    this: MapStore,
    dispatcher: ActionDispatcher
): void {
    this.locationPopupCoordinates = undefined
}
