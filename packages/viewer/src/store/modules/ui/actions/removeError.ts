import type { ErrorMessage } from '@swissgeo/log/Message'

import log, { LogPreDefinedColor } from '@swissgeo/log'

import type { UIStore } from '@/store/modules/ui/types/ui'
import type { ActionDispatcher } from '@/store/types'

export default function removeError(
    this: UIStore,
    error: ErrorMessage,
    dispatcher: ActionDispatcher
): void {
    if (!error) {
        log.error({
            title: 'UI store / removeError',
            titleColor: LogPreDefinedColor.Red,
            messages: ['Wrong type of error passed to removeError', error, dispatcher],
        })
        return
    }
    if (this.errors.has(error)) {
        this.errors.delete(error)
    }
}
