import log, { LogPreDefinedColor } from '@swissgeo/log'
import { isNumber } from '@swissgeo/numbers'

import type { UIStore } from '@/store/modules/ui/types'
import type { ActionDispatcher } from '@/store/types'

export default function setShowLoadingBar(
    this: UIStore,
    loading: boolean,
    requester: string,
    dispatcher: ActionDispatcher
): void {
    if (!this.loadingBarRequesters[requester]) {
        return
    }

    if (loading) {
        if (!isNumber(this.loadingBarRequesters[requester])) {
            this.loadingBarRequesters[requester] = 0
        }
        this.loadingBarRequesters[requester] += 1
    } else {
        if (this.loadingBarRequesters[requester] > 0) {
            this.loadingBarRequesters[requester] -= 1
        }
        if (this.loadingBarRequesters[requester] <= 0) {
            delete this.loadingBarRequesters[requester]
        }
    }

    log.debug({
        title: 'UI store / setShowLoadingBar',
        titleColor: LogPreDefinedColor.Red,
        messages: [
            `Loading bar has been set; requester=${requester}, loading=${loading}, loadingBarRequesters=`,
            this.loadingBarRequesters,
        ],
    })
}
