import type { FlatExtent } from '@swissgeo/coordinates'

import type { PrintStore } from '@/store/modules/print/types'
import type { ActionDispatcher } from '@/store/types'

export default function setPrintExtent(
    this: PrintStore,
    printExtent: FlatExtent | undefined,
    dispatcher: ActionDispatcher
): void {
    this.printExtent = printExtent
}
