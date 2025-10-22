import log, { LogPreDefinedColor } from '@swissgeo/log'
import { ErrorMessage } from '@swissgeo/log/Message'

import type { UIStore } from '@/store/modules/ui/types/ui'
import type { ActionDispatcher } from '@/store/types'

export default function addErrors(
    this: UIStore,
    errors: ErrorMessage[],
    dispatcher: ActionDispatcher
): void {
    if (Array.isArray(errors) && errors.every((error) => error)) {
        errors
            .filter(
                (error) =>
                    ![...this.errors].some((otherError) => error.isEqual(otherError))
            )
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
