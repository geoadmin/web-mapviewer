import type { PositionStore } from '@/store/modules/position/types/position'
import type { ActionDispatcher } from '@/store/types'
import type { CoordinateFormat } from '@/utils/coordinates/coordinateFormat'

export default function setDisplayedFormat(
    this: PositionStore,
    displayedFormat: CoordinateFormat,
    dispatcher: ActionDispatcher
): void {
    this.displayFormat = displayedFormat
}
