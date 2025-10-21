import type { EditableFeature } from '@/api/features.api'
import type { FeaturesStore } from '@/store/modules/features/types/features'
import type { ActionDispatcher } from '@/store/types'

import getEditableFeatureWithId from '@/store/modules/features/utils/getEditableFeatureWithId'

/**
 * Changes the title of the feature. Only change the title if the feature is editable and part of
 * the currently selected features
 */
export default function changeFeatureTitle(
    this: FeaturesStore,
    payload: { feature: EditableFeature; title: string },
    dispatcher: ActionDispatcher
) {
    const { feature, title } = payload
    const selectedFeature: EditableFeature | undefined = getEditableFeatureWithId(
        this.selectedEditableFeatures,
        feature.id
    )
    if (selectedFeature && selectedFeature.isEditable) {
        selectedFeature.title = title
    }
}
