import type { LayerFeature } from '@/api/features.api'
import type { FeaturesForLayer, FeaturesStore } from '@/store/modules/features/types/features'

export default function selectedLayerFeatures(this: FeaturesStore): LayerFeature[] {
    return this.selectedFeaturesByLayerId
        .map((featuresForLayer: FeaturesForLayer) => featuresForLayer.features)
        .flat()
}
