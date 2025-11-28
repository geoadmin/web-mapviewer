import type { PositionStore } from '@/store/modules/position/types/position'
import type { ActionDispatcher } from '@/store/types'

export default function setHasOrientation(
    this: PositionStore,
    hasOrientation: boolean,
    dispatcher: ActionDispatcher
): void {
    this.hasOrientation = hasOrientation
}
