import type { ActionDispatcher } from '@/store/types'

import { BREAKPOINT_PHONE_HEIGHT, BREAKPOINT_PHONE_WIDTH } from '@/config/responsive.config'
import useUIStore, { UIModes } from '@/store/modules/ui'

export function updateUiModeFromScreenSize(dispatcher: ActionDispatcher): void {
    const uiStore = useUIStore()

    let wantedUiMode

    if (
        uiStore.width < BREAKPOINT_PHONE_WIDTH ||
        uiStore.height < BREAKPOINT_PHONE_HEIGHT
    ) {
        wantedUiMode = UIModes.Phone
    } else {
        // so the UI mode Desktop also includes the tablet mode.
        wantedUiMode = UIModes.Desktop
    }
    if (wantedUiMode !== uiStore.mode) {
        uiStore.setUiMode(wantedUiMode, dispatcher)
    }
}