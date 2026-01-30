import type { AppStore, AppStateNames } from '@/store/modules/app/types'

export default function isParsingUrl(this: AppStore): boolean {
    const parsingStateNames: AppStateNames[] = ['URL_PARSING', 'READY', 'MAP_SHOWN']

    return parsingStateNames.includes(this.appState.name)
}
