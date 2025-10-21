import type { AppStore } from '@/store/modules/app/types/app'
import type { ActionDispatcher } from '@/store/types'

import { sendMapReadyEventToParent } from '@/api/iframePostMessageEvent.api'

export default function setMapModuleReady(this: AppStore, dispatcher: ActionDispatcher) {
    this.isMapReady = true
    sendMapReadyEventToParent()
}
