import log, { LogPreDefinedColor } from '@swissgeo/log'

import type { PrintStore } from '@/store/modules/print/types'
import type { ActionDispatcher } from '@/store/types'

import { readPrintCapabilities } from '@/api/print.api'

export default function loadPrintLayouts(this: PrintStore, dispatcher: ActionDispatcher): void {
    readPrintCapabilities()
        .then((layouts) => {
            this.layouts = layouts
        })
        .catch((error) => {
            log.error({
                title: 'Print store / loadPrintLayouts',
                titleStyle: {
                    backgroundColor: LogPreDefinedColor.Red,
                },
                messages: ['Error while loading print layouts', error],
            })
        })
}
