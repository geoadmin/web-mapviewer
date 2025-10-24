import type { UIStore } from '@/store/modules/ui/types/ui'
import type { ActionDispatcher } from '@/store/types'

import { MAX_WIDTH_SHOW_FLOATING_TOOLTIP } from '@/config/responsive.config'
import { BREAKPOINT_PHONE_HEIGHT, BREAKPOINT_PHONE_WIDTH } from '@/config/responsive.config'
import { UIModes } from '@/store/modules/ui'
import { FeatureInfoPositions } from '@/store/modules/ui/types/featureInfoPositions.enum'

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

    updateUiModeFromScreenSize.call(this, dispatcher)
}

function updateUiModeFromScreenSize(this: UIStore, dispatcher: ActionDispatcher): void {
    let wantedUiMode

    if (
        this.width < BREAKPOINT_PHONE_WIDTH ||
        this.height < BREAKPOINT_PHONE_HEIGHT
    ) {
        wantedUiMode = UIModes.Phone
    } else {
        // so the UI mode Desktop also includes the tablet mode.
        wantedUiMode = UIModes.Desktop
    }
    if (wantedUiMode !== this.mode) {
        this.setUiMode(wantedUiMode, dispatcher)
    }
}