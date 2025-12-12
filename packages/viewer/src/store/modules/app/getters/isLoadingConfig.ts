import type { AppStore } from '@/store/modules/app/types'

import { AppStateNames } from '@/store/modules/app/types'

export default function isLoadingConfig(this: AppStore): boolean {
    return this.appState.name === AppStateNames.Initializing
}
