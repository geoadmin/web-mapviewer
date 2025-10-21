import type { DrawingStore } from '@/store/modules/drawing/types/drawing'
import type { ActionDispatcher } from '@/store/types'

import useFeaturesStore from '@/store/modules/features.store'

export default function deleteDrawingFeature(
    this: DrawingStore,
    featureId: string,
    dispatcher: ActionDispatcher
) {
    const featuresStore = useFeaturesStore()
    featuresStore.clearAllSelectedFeatures(dispatcher)
    this.featureIds = this.featureIds.filter(
        (existingFeatureId) => existingFeatureId !== featureId
    )
}
