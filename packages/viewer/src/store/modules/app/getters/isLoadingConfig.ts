import type { AppStore } from '@/store/modules/app/types/app'

import { AppStateNames } from '@/store/modules/app/types/appState'

export default function isLoadingConfig(this: AppStore): boolean {
    return this.appState.name === AppStateNames.Initializing
}
