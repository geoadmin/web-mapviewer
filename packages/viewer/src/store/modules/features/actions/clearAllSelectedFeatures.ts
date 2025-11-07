import type { FeaturesStore } from '@/store/modules/features/types/features'
import type { ActionDispatcher } from '@/store/types'

import useProfileStore from '@/store/modules/profile'

/** Removes all selected features from the map */
export default function clearAllSelectedFeatures(
    this: FeaturesStore,
    dispatcher: ActionDispatcher
) {
    this.selectedFeaturesByLayerId.splice(-1)
    this.selectedEditableFeatures.splice(-1)
    if (this.highlightedFeatureId) {
        this.highlightedFeatureId = undefined
    }
    const profileStore = useProfileStore()
    if (profileStore.feature) {
        profileStore.setProfileFeature(undefined, dispatcher)
    }
}
