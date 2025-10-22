import type { PrintLayout } from '@/api/print.api'
import type { PrintStore } from '@/store/modules/print/types/print'
import type { ActionDispatcher } from '@/store/types'

interface SelectedLayoutOptions {
    layout?: PrintLayout
}

export default function setSelectedLayout(
    this: PrintStore,
    options: SelectedLayoutOptions,
    dispatcher: ActionDispatcher
): void {
    this.selectedLayout = options.layout
}
