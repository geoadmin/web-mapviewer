import {
    BREAKPOINT_PHONE_HEIGHT,
    BREAKPOINT_PHONE_WIDTH,
    MAX_WIDTH_SHOW_FLOATING_TOOLTIP,
} from '@swissgeo/staging-config/constants'

import type { UIStore, UIMode } from '@/store/modules/ui/types'
import type { ActionDispatcher } from '@/store/types'

export default function setSize(
    this: UIStore,
    width: number,
    height: number,
    dispatcher: ActionDispatcher
): void {
    this.height = height
    this.width = width

    if (this.featureInfoPosition !== 'none' && this.width < MAX_WIDTH_SHOW_FLOATING_TOOLTIP) {
        this.featureInfoPosition = 'bottomPanel'
    }

    let wantedUiMode: UIMode
    if (this.width < BREAKPOINT_PHONE_WIDTH || this.height < BREAKPOINT_PHONE_HEIGHT) {
        wantedUiMode = 'phone'
    } else {
        // so the UI mode Desktop also includes the tablet mode.
        wantedUiMode = 'desktop'
    }
    if (wantedUiMode !== this.mode) {
        this.setUiMode(wantedUiMode, dispatcher)
    }
}
