import type { AppStore } from '@/store/modules/app/types/app'

import { AppStateNames } from '@/store/modules/app/types/appState'

export default function isConfigLoaded(this: AppStore): boolean {
    return [
        AppStateNames.ConfigLoaded,
        AppStateNames.LegacyParsing,
        AppStateNames.UrlParsing,
        AppStateNames.Ready,
        AppStateNames.MapShown,
    ].includes(this.appState.name)
}
