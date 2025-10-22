import type { EditableFeature } from '@/api/features.api'
import type { FeaturesStore } from '@/store/modules/features/types/features'
import type { ActionDispatcher } from '@/store/types'

import getEditableFeatureWithId from '@/store/modules/features/utils/getEditableFeatureWithId'

/**
 * Changes the description of the feature. Only change the description if the feature is editable
 * and part of the currently selected features
 */
export default function changeFeatureDescription(
    this: FeaturesStore,
    feature: EditableFeature,
    description: string,
    dispatcher: ActionDispatcher
) {
    const selectedFeature = getEditableFeatureWithId(this.selectedEditableFeatures, feature.id)
    if (selectedFeature && selectedFeature.isEditable) {
        selectedFeature.description = description
    }
}
