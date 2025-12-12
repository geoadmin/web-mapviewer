import type { UIStore } from '@/store/modules/ui/types'
import type { ActionDispatcher } from '@/store/types'

import {
    BREAKPOINT_PHONE_HEIGHT,
    BREAKPOINT_PHONE_WIDTH,
    MAX_WIDTH_SHOW_FLOATING_TOOLTIP,
} from '@/config/responsive.config'
import { FeatureInfoPositions } from '@/store/modules/ui/types'
import { UIModes } from '@/store/modules/ui/types'

export default function setSize(
    this: UIStore,
    width: number,
    height: number,
    dispatcher: ActionDispatcher
): void {
    this.height = height
    this.width = width

    if (
        this.featureInfoPosition !== FeatureInfoPositions.None &&
        this.width < MAX_WIDTH_SHOW_FLOATING_TOOLTIP
    ) {
        this.featureInfoPosition = FeatureInfoPositions.BottomPanel
    }

    let wantedUiMode: UIModes
    if (this.width < BREAKPOINT_PHONE_WIDTH || this.height < BREAKPOINT_PHONE_HEIGHT) {
        wantedUiMode = UIModes.Phone
    } else {
        // so the UI mode Desktop also includes the tablet mode.
        wantedUiMode = UIModes.Desktop
    }
    if (wantedUiMode !== this.mode) {
        this.setUiMode(wantedUiMode, dispatcher)
    }
}
