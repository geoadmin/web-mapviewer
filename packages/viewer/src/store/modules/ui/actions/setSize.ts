import type { UIStore } from '@/store/modules/ui/types/ui'
import type { ActionDispatcher } from '@/store/types'

import { MAX_WIDTH_SHOW_FLOATING_TOOLTIP } from '@/config/responsive.config'
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
}
