import type { FlatExtent } from '@swissgeo/coordinates'

import type { PrintStore } from '@/store/modules/print/types/print'
import type { ActionDispatcher } from '@/store/types'

interface PrintExtentOptions {
    printExtent?: FlatExtent
}


export default function setPrintExtent(
    this: PrintStore,
    options: PrintExtentOptions,
    dispatcher: ActionDispatcher
): void {
    this.printExtent = options.printExtent
}
