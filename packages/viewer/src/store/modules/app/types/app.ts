import type { AppState } from '@/store/modules/app/types/appState'

/** Module that tells if the app has finished loading (is ready to show stuff) */
export interface AppStoreState {
    appState: AppState
    hasPendingUrlParsing: boolean
}
export type AppStoreGetters = {
    isCurrentStateFulfilled(): boolean
    isLoadingConfig(): boolean
    isConfigLoaded(): boolean
    isParsingLegacy(): boolean
    isSyncingStore(): boolean
    isReady(): boolean
    isMapReady(): boolean
}

export type AppStore = ReturnType<typeof import('@/store/modules/app').default>
