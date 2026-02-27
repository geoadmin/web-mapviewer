import log, { LogPreDefinedColor } from '@swissgeo/log'

import type { PrintStore } from '@/store/modules/print/types'
import type { ActionDispatcher } from '@/store/types'

import { printAPI } from '@/utils/print/print.api'

export default function loadPrintLayouts(this: PrintStore, dispatcher: ActionDispatcher): void {
    printAPI
        .readPrintCapabilities()
        .then((layouts) => {
            this.layouts = layouts
        })
        .catch((error) => {
            log.error({
                title: 'Print store / loadPrintLayouts',
                titleColor: LogPreDefinedColor.Red,
                messages: ['Error while loading print layouts', error],
            })
        })
}
