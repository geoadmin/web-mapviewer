import type { FeaturesStore } from '@/store/modules/features/types/features'
import type { ActionDispatcher } from '@/store/types'

import useProfileStore from '@/store/modules/profile'

/** Removes all selected features from the map */
export default function clearSelectedFeaturesByLayerId(
    this: FeaturesStore,
    layerId: string,
    dispatcher: ActionDispatcher
) {
    this.selectedFeaturesByLayerId = this.selectedFeaturesByLayerId.filter(
        (featuresForLayer) => featuresForLayer.layerId !== layerId
    )
    if (this.highlightedFeatureId) {
        this.highlightedFeatureId = undefined
    }
    const profileStore = useProfileStore()
    if (profileStore.feature) {
        profileStore.setProfileFeature(undefined, dispatcher)
    }
}
