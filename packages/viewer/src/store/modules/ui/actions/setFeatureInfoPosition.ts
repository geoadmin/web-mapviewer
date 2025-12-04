import type { UIStore } from '@/store/modules/ui/types'
import type { FeatureInfoPosition } from '@/store/modules/ui/types'
import type { ActionDispatcher } from '@/store/types'

import { MAX_WIDTH_SHOW_FLOATING_TOOLTIP } from '@/config/responsive.config'

export default function setFeatureInfoPosition(
    this: UIStore,
    position: FeatureInfoPosition,
    dispatcher: ActionDispatcher
): void {
    if (position !== 'none' && this.width < MAX_WIDTH_SHOW_FLOATING_TOOLTIP) {
        this.featureInfoPosition = 'bottompanel'
    } else {
        this.featureInfoPosition = position
    }
}
