import type { PositionStore } from '@/store/modules/position/types/position'
import type { ActionDispatcher } from '@/store/types'

export default function setAutoRotation(
    this: PositionStore,
    autoRotation: boolean,
    dispatcher: ActionDispatcher
): void {
    this.autoRotation = autoRotation
}
