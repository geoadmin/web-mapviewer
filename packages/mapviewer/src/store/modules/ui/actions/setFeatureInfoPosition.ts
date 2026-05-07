import { MAX_WIDTH_SHOW_FLOATING_TOOLTIP } from '@swissgeo/staging-config/constants'

import type { FeatureInfoPosition, UIStore } from '@/store/modules/ui/types'
import type { ActionDispatcher } from '@/store/types'

export default function setFeatureInfoPosition(
    this: UIStore,
    position: FeatureInfoPosition,
    dispatcher: ActionDispatcher
): void {
    if (position !== 'none' && this.width < MAX_WIDTH_SHOW_FLOATING_TOOLTIP) {
        this.featureInfoPosition = 'bottomPanel'
    } else {
        this.featureInfoPosition = position
    }
}
