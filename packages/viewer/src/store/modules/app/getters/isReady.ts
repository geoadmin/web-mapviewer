import type { AppStore } from '@/store/modules/app/types'

import { AppStateNames } from '@/store/modules/app/types'

export default function isReady(this: AppStore): boolean {
    return [AppStateNames.Ready, AppStateNames.MapShown].includes(this.appState.name)
}
