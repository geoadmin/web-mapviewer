import type { ActionDispatcher } from '@/store/types'

import { AppStates, type AppStore } from '@/store/modules/app/types/app'

export default function setAppIsReady (this: AppStore, dispatcher: ActionDispatcher) {
    this.appState = AppStates.ConfigLoaded
}
