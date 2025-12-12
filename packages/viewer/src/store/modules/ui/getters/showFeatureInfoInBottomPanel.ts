import type { UIStore } from '@/store/modules/ui/types'

import { FeatureInfoPositions } from '@/store/modules/ui/types'

export default function showFeatureInfoInBottomPanel(this: UIStore): boolean {
    return (
        this.featureInfoPosition === FeatureInfoPositions.BottomPanel ||
        (this.featureInfoPosition === FeatureInfoPositions.Default && this.isPhoneMode)
    )
}
