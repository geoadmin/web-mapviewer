import type { AppStore } from '@/store/modules/app/types'

export default function isParsingLegacy(this: AppStore): boolean {
    return this.appState.name === 'LEGACY_PARSING'
}
