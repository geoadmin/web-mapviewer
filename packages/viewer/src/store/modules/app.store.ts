import { defineStore } from 'pinia'

import type { ActionDispatcher } from '@/store/types'

import { sendMapReadyEventToParent } from '@/api/iframePostMessageEvent.api'

/** Module that tells if the app has finished loading (is ready to show stuff) */
interface AppState {
    /** Flag that tells if the app is ready to show data and the map */
    isReady: boolean
    /**
     * Flag telling that the Map Module is ready. This is useful for E2E testing which should not
     * start before the Map Module is ready.
     */
    isMapReady: boolean
}

export enum AppStoreActions {
    SetAppIsReady = 'setAppIsReady',
    SetMapModuleReady = 'setMapModuleReady',
}

const useAppStore = defineStore('app', {
    state: (): AppState => ({
        isReady: false,
        isMapReady: false,
    }),
    getters: {},
    actions: {
        [AppStoreActions.SetAppIsReady](dispatcher: ActionDispatcher) {
            this.isReady = true
        },
        [AppStoreActions.SetMapModuleReady](dispatcher: ActionDispatcher) {
            this.isMapReady = true
            sendMapReadyEventToParent()
        },
    },
})

export default useAppStore
