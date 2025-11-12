import type { AppStore } from '@/store/modules/app/types/app'

import { AppStateNames } from '@/store/modules/app/types/appState'

// This is a flag to tell if the layer config / topics  are loaded.
// We should rename it once there is less people working on every file
export default function isParsingLegacy(this: AppStore): boolean {
    return this.appState.name === AppStateNames.LegacyParsing
}
