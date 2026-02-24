import type { AppStore } from '@/store/modules/app/types'
import type { ActionDispatcher } from '@/store/types'

export default function setInitialUrlParsingHasHappened(
    this: AppStore,
    dispatcher: ActionDispatcher
) {
    this.initialUrlParsingHasHappened = true
}
