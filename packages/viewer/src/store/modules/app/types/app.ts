/** Module that tells if the app has finished loading (is ready to show stuff) */
export interface AppStoreState {

    /**
     * variable to store the state of the app
     */
    appState: AppState
    /**
     * Flag telling that the Map Module is ready. This is useful for E2E testing which should not
     * start before the Map Module is ready.
     */
    isMapReady: boolean
}
export type AppStoreGetters = {
    isLoadingConfig(): boolean,
    isConfigLoaded(): boolean,
    isParsingLegacy(): boolean,
    isSyncingStore(): boolean,
    isReady(): boolean
}

export type AppStore = ReturnType<typeof import('../index.ts').default>

export enum AppStates {
    Initializing = 'INITIALIZING',
    ConfigLoaded = 'CONFIG_LOADED',
    LegacyParsing = 'LEGACY_PARSING',
    SyncingStore = 'SYNCING_STORE',
    Ready = 'READY'
}

export type AppState = AppStates
