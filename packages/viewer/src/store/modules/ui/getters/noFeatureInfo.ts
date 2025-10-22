import type { UIStore } from '@/store/modules/ui/types/ui'

import { FeatureInfoPositions } from '@/store/modules/ui/types/featureInfoPositions.enum'

export default function noFeatureInfo(this: UIStore): boolean {
    return this.featureInfoPosition === FeatureInfoPositions.None
}
