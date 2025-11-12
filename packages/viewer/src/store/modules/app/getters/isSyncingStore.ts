import type { AppStore } from '@/store/modules/app/types/app'

import { AppStateNames } from '@/store/modules/app/types/appState'

export default function isSyncingStore(this: AppStore): boolean {
    return [AppStateNames.SyncingStore, AppStateNames.Ready, AppStateNames.MapShown].includes(
        this.appState.name
    )
}
