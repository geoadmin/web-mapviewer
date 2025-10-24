import type { MapStore } from '@/store/modules/map/types/map'
import type { ActionDispatcher } from '@/store/types'

export default function setPrintMode(
    this: MapStore,
    isActive: boolean,
    dispatcher: ActionDispatcher
): void {
    this.printMode = isActive
}
