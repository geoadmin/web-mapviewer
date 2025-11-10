import type { ActionDispatcher } from '@/store/types'

import { sendMapReadyEventToParent } from '@/api/iframePostMessageEvent.api'
import { AppStates, type AppStore } from '@/store/modules/app/types/app'

export default function setMapModuleReady(this: AppStore, dispatcher: ActionDispatcher) {
    this.appState = AppStates.MapShown
    sendMapReadyEventToParent()
}
