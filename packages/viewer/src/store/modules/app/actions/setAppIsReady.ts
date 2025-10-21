import type { AppStore } from '@/store/modules/app/types/app'
import type { ActionDispatcher } from '@/store/types'

export default function setAppIsReady (this: AppStore, dispatcher: ActionDispatcher) {
    this.isReady = true
}
