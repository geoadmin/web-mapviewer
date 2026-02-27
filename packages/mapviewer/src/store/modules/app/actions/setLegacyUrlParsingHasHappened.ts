import type { AppStore } from '@/store/modules/app/types'
import type { ActionDispatcher } from '@/store/types'

export default function setLegacyUrlParsingHasHappened(
    this: AppStore,
    dispatcher: ActionDispatcher
) {
    this.legacyUrlParsingHasHappened = true
}
