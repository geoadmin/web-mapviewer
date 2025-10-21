import type { EditableFeature, LayerFeature } from '@/api/features.api'
import type { FeaturesStore } from '@/store/modules/features/types/features'

export default function selectedFeatures(this: FeaturesStore): (EditableFeature | LayerFeature)[] {
    return [...this.selectedEditableFeatures, ...this.selectedLayerFeatures]
}
