import type { EditableFeature } from '@/api/features.api'
import type { FeaturesStore } from '@/store/modules/features/types/features'
import type { ActionDispatcher } from '@/store/types'

import getEditableFeatureWithId from '@/store/modules/features/utils/getEditableFeatureWithId'

/** In drawing mode, tells the state if a given feature is being dragged. */
export default function changeFeatureIsDragged(
    this: FeaturesStore,
    payload: { feature: EditableFeature; isDragged: boolean },
    dispatcher: ActionDispatcher
) {
    const { feature, isDragged } = payload
    const selectedFeature = getEditableFeatureWithId(
        this.selectedEditableFeatures,
        feature.id
    )
    if (selectedFeature && selectedFeature.isEditable) {
        selectedFeature.isDragged = isDragged
    }
}
