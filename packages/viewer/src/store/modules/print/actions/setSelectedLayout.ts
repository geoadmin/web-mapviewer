import type { PrintLayout } from '@swissgeo/api'

import type { PrintStore } from '@/store/modules/print/types'
import type { ActionDispatcher } from '@/store/types'

export default function setSelectedLayout(
    this: PrintStore,
    layout: PrintLayout | undefined,
    dispatcher: ActionDispatcher
): void {
    this.selectedLayout = layout
}
