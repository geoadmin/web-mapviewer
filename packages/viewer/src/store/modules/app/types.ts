import type useAppStore from '@/store/modules/app/index'

export enum AppStateNames {
    Initializing = 'INITIALIZING',
    ConfigLoaded = 'CONFIG_LOADED',
    LegacyParsing = 'LEGACY_PARSING',
    UrlParsing = 'URL_PARSING',
    Ready = 'READY',
    MapShown = 'MAP_SHOWN',
}

export interface AppState {
    name: AppStateNames
    isFulfilled: () => boolean
    next: () => AppState
}

/** Module that tells if the app has finished loading (is ready to show stuff) */
export interface AppStoreState {
    appState: AppState
    initialUrlParsingHasHappened: boolean
    legacyUrlParsingHasHappened: boolean
    hasPendingUrlParsing: boolean
}
export type AppStoreGetters = {
    isCurrentStateFulfilled(): boolean
    isLoadingConfig(): boolean
    isConfigLoaded(): boolean
    isParsingLegacy(): boolean
    isParsingUrl(): boolean
    isReady(): boolean
    isMapReady(): boolean
}

export type AppStore = ReturnType<typeof useAppStore>
