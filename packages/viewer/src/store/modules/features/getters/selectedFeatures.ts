import type { EditableFeature, LayerFeature } from '@swissgeo/api'

import type { FeaturesStore } from '@/store/modules/features/types'

export default function selectedFeatures(this: FeaturesStore): (EditableFeature | LayerFeature)[] {
    return [...this.selectedEditableFeatures, ...this.selectedLayerFeatures]
}
