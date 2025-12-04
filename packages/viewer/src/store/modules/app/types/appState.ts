export type AppStateNames =
    | 'INITIALIZING'
    | 'CONFIG_LOADED'
    | 'LEGACY_PARSING'
    | 'URL_PARSING'
    | 'READY'
    | 'MAP_SHOWN'

export interface AppState {
    name: AppStateNames
    isFulfilled: () => boolean
    next: () => AppState
}
