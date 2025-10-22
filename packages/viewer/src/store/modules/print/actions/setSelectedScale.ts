import type { PrintStore } from '@/store/modules/print/types/print'
import type { ActionDispatcher } from '@/store/types'

interface SetSelectedScaleOptions {
    scale?: number
}

export default function setSelectedScale(
    this: PrintStore,
    options: SetSelectedScaleOptions,
    dispatcher: ActionDispatcher
): void {
    this.selectedScale = options.scale
}
