import type { UIStore } from '@/store/modules/ui/types/ui'

import { FeatureInfoPositions } from '@/store/modules/ui/types/featureInfoPositions.enum'

export default function showFeatureInfoInTooltip(this: UIStore): boolean {
    return (
        this.featureInfoPosition === FeatureInfoPositions.ToolTip ||
        (this.featureInfoPosition === FeatureInfoPositions.Default && !this.isPhoneMode)
    )
}
