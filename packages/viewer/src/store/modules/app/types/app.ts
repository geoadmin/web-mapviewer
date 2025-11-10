/** Module that tells if the app has finished loading (is ready to show stuff) */
export interface AppStoreState {

    /**
     * variable to store the state of the app
     */
    appState: AppState
}
export type AppStoreGetters = {
    isLoadingConfig(): boolean,
    isConfigLoaded(): boolean,
    isParsingLegacy(): boolean,
    isSyncingStore(): boolean,
    isReady(): boolean,
    isMapReady(): boolean,

}

export type AppStore = ReturnType<typeof import('../index.ts').default>

export enum AppStates {
    Initializing = 'INITIALIZING',
    ConfigLoaded = 'CONFIG_LOADED',
    LegacyParsing = 'LEGACY_PARSING',
    SyncingStore = 'SYNCING_STORE',
    Ready = 'READY',
    MapShown = 'MAP_SHOWN'
}

export type AppState = AppStates
