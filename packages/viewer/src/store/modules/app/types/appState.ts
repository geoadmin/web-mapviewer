
export enum AppStateNames {
    Initializing = 'INITIALIZING',
    ConfigLoaded = 'CONFIG_LOADED',
    LegacyParsing = 'LEGACY_PARSING',
    SyncingStore = 'SYNCING_STORE',
    Ready = 'READY',
    MapShown = 'MAP_SHOWN',
}

export interface AppState {
    name: AppStateNames
    isFulfilled: () => boolean
    next: () => AppState
}
