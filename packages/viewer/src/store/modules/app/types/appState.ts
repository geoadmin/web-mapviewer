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
