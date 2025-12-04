import log, { LogPreDefinedColor } from '@swissgeo/log'
import { ErrorMessage } from '@swissgeo/log/Message'

import type { UIStore } from '@/store/modules/ui/types'
import type { ActionDispatcher } from '@/store/types'

export default function addErrors(
    this: UIStore,
    errors: ErrorMessage | ErrorMessage[],
    dispatcher: ActionDispatcher
): void {
    const allErrors = Array.isArray(errors) ? errors : [errors]

    if (Array.isArray(allErrors) && allErrors.every((error) => error)) {
        allErrors
            .filter((error) => ![...this.errors].some((otherError) => error.isEqual(otherError)))
            .forEach((error) => {
                this.errors.add(error)
            })
    } else {
        log.error({
            title: 'UI store / addErrors',
            titleColor: LogPreDefinedColor.Red,
            messages: ['Wrong type of errors passed to addErrors', errors, dispatcher],
        })
    }
}
