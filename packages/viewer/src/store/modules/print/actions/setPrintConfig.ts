import type { NewPrintServiceConfig, PrintStore } from '@/store/modules/print/types/print'
import type { ActionDispatcher } from '@/store/types'

export default function setPrintConfig(
    this: PrintStore,
    config: NewPrintServiceConfig,
    dispatcher: ActionDispatcher
): void {
    this.config = config
}
