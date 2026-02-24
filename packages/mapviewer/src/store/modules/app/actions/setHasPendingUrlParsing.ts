import type { AppStore } from '@/store/modules/app/types'
import type { ActionDispatcher } from '@/store/types'

export default function setHasPendingUrlParsing(
    this: AppStore,
    hasPendingUrlParsing: boolean,
    dispatcher: ActionDispatcher
) {
    this.hasPendingUrlParsing = hasPendingUrlParsing
}
