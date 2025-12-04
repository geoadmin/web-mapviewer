import type { LayerFeature } from '@/api/features/types'
import type { FeaturesForLayer, FeaturesStore } from '@/store/modules/features/types'

export default function selectedLayerFeatures(this: FeaturesStore): LayerFeature[] {
    return this.selectedFeaturesByLayerId
        .map((featuresForLayer: FeaturesForLayer) => featuresForLayer.features)
        .flat()
}
