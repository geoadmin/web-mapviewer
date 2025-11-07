import type { AppState, AppStore } from '@/store/modules/app/types/app'
import type { ActionDispatcher } from '@/store/types'


export default function setAppState (this: AppStore, appState: AppState, dispatcher: ActionDispatcher) {
    this.appState = appState
}
