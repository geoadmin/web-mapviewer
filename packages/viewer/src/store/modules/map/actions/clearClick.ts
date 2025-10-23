import type { MapStore } from '@/store/modules/map/types/map'
import type { ActionDispatcher } from '@/store/types'

export default function clearClick(
    this: MapStore,
    dispatcher: ActionDispatcher
): void {
    this.clickInfo = undefined
}
