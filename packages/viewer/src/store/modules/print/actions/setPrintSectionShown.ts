import type { PrintStore } from '@/store/modules/print/types/print'
import type { ActionDispatcher } from '@/store/types'

export default function setPrintSectionShown(
    this: PrintStore,
    show: boolean,
    dispatcher: ActionDispatcher
): void {
    this.printSectionShown = show
}
