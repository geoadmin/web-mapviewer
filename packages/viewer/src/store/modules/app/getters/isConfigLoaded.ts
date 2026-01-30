import type { AppStateNames, AppStore } from '@/store/modules/app/types'

export default function isConfigLoaded(this: AppStore): boolean {
    const configLoadedStates: AppStateNames[] = [
        'CONFIG_LOADED',
        'LEGACY_PARSING',
        'URL_PARSING',
        'READY',
        'MAP_SHOWN',
    ]
    return configLoadedStates.includes(this.appState.name)
}
