import type { AppStore } from '@/store/modules/app/types/app'

import { AppStateNames } from '@/store/modules/app/types/appState'

export default function isMapReady(this: AppStore): boolean {
    return this.appState.name === AppStateNames.MapShown
}
