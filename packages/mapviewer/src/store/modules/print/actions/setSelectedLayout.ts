import type { PrintStore } from '@/store/modules/print/types'
import type { ActionDispatcher } from '@/store/types'
import type { PrintLayout } from '@/utils/print/types'

export default function setSelectedLayout(
    this: PrintStore,
    layout: PrintLayout | undefined,
    dispatcher: ActionDispatcher
): void {
    this.selectedLayout = layout
}
