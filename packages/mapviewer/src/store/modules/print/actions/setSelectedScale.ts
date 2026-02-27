import type { PrintStore } from '@/store/modules/print/types'
import type { ActionDispatcher } from '@/store/types'

export default function setSelectedScale(
    this: PrintStore,
    scale: number | undefined,
    dispatcher: ActionDispatcher
): void {
    this.selectedScale = scale
}
