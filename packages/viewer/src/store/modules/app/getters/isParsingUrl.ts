import type { AppStore } from '@/store/modules/app/types'

import { AppStateNames } from '@/store/modules/app/types'

export default function isParsingUrl(this: AppStore): boolean {
    return [AppStateNames.UrlParsing, AppStateNames.Ready, AppStateNames.MapShown].includes(
        this.appState.name
    )
}
