import { MAX_WIDTH_SHOW_FLOATING_TOOLTIP } from '@swissgeo/staging-config/constants'

import type { UIStore } from '@/store/modules/ui/types'
import type { ActionDispatcher } from '@/store/types'

import { FeatureInfoPositions } from '@/store/modules/ui/types'

export default function setFeatureInfoPosition(
    this: UIStore,
    position: FeatureInfoPositions,
    dispatcher: ActionDispatcher
): void {
    if (position !== FeatureInfoPositions.None && this.width < MAX_WIDTH_SHOW_FLOATING_TOOLTIP) {
        this.featureInfoPosition = FeatureInfoPositions.BottomPanel
    } else {
        this.featureInfoPosition = position
    }
}
