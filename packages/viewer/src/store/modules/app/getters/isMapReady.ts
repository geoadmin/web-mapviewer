import type { AppStore } from '@/store/modules/app/types'

import { AppStateNames } from '@/store/modules/app/types'

export default function isMapReady(this: AppStore): boolean {
    return this.appState.name === AppStateNames.MapShown
}
