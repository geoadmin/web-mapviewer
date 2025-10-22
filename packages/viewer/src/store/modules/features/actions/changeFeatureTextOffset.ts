import type { EditableFeature } from '@/api/features.api'
import type { FeaturesStore } from '@/store/modules/features/types/features'
import type { ActionDispatcher } from '@/store/types'

import getEditableFeatureWithId from '@/store/modules/features/utils/getEditableFeatureWithId'

/**
 * Changes the text offset of the feature. Only change the text offset if the feature is editable
 * and part of the currently selected features
 */
export default function changeFeatureTextOffset(
    this: FeaturesStore,
    feature: EditableFeature,
    textOffset: [number, number],
    dispatcher: ActionDispatcher
) {
    const editableFeature = getEditableFeatureWithId(this.selectedEditableFeatures, feature.id)
    if (editableFeature && editableFeature.isEditable) {
        editableFeature.textOffset = textOffset
    }
}
