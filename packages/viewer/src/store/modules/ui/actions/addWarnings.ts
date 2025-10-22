import log, { LogPreDefinedColor } from '@swissgeo/log'
import { WarningMessage } from '@swissgeo/log/Message'

import type { UIStore } from '@/store/modules/ui/types/ui'
import type { ActionDispatcher } from '@/store/types'

export default function addWarnings(
    this: UIStore,
    warnings: WarningMessage[],
    dispatcher: ActionDispatcher
): void {
    if (Array.isArray(warnings) && warnings.every((warning) => warning instanceof WarningMessage)) {
        warnings
            .filter(
                (warning) =>
                    ![...this.warnings].some((otherWarning) => warning.isEqual(otherWarning))
            )
            .forEach((warning) => {
                this.warnings.add(warning)
            })
    } else {
        log.error({
            title: 'UI store / addWarnings',
            titleColor: LogPreDefinedColor.Red,
            messages: ['Wrong type of warnings passed to addWarnings', warnings, dispatcher],
        })
    }
}
