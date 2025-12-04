import type { AppStore } from '@/store/modules/app/types'

export default function isConfigLoaded(this: AppStore): boolean {
    return ['CONFIG_LOADED', 'LEGACY_PARSING', 'URL_PARSING', 'READY', 'MAP_SHOWN'].includes(
        this.appState.name
    )
}
