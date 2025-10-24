import log, { LogPreDefinedColor } from '@swissgeo/log'
import { WarningMessage } from '@swissgeo/log/Message'

import type { UIStore } from '@/store/modules/ui/types/ui'
import type { ActionDispatcher } from '@/store/types'

export default function removeWarning(
    this: UIStore,
    warning: WarningMessage,
    dispatcher: ActionDispatcher
): void {
    if (!(warning instanceof WarningMessage)) {
        log.error({
            title: 'UI store / removeWarning',
            titleColor: LogPreDefinedColor.Red,
            messages: ['Wrong type of warning passed to removeWarning', warning, dispatcher],
        })
        return
    }
    if (this.warnings.has(warning)) {
        this.warnings.delete(warning)
    }
}
