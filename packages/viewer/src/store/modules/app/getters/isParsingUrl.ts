import type { AppStore } from '@/store/modules/app/types/app'

import { AppStateNames } from '@/store/modules/app/types/appState'

export default function isParsingUrl(this: AppStore): boolean {
    return [AppStateNames.UrlParsing, AppStateNames.Ready, AppStateNames.MapShown].includes(
        this.appState.name
    )
}
