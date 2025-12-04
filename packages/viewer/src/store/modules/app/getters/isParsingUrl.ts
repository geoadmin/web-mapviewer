import type { AppStore } from '@/store/modules/app/types'

export default function isParsingUrl(this: AppStore): boolean {
    return ['URL_PARSING', 'READY', 'MAP_SHOWN'].includes(this.appState.name)
}
