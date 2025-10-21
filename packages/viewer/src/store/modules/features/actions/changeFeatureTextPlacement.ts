import type { EditableFeature } from '@/api/features.api'
import type { FeaturesStore } from '@/store/modules/features/types/features'
import type { ActionDispatcher } from '@/store/types'

import getEditableFeatureWithId from '@/store/modules/features/utils/getEditableFeatureWithId'
import { TextPlacement } from '@/utils/featureStyleUtils'

/**
 * Changes the title text placement of the feature. Only changes the text placement
 * if the feature is editable and part of the currently selected features
 */
export default function changeFeatureTextPlacement(
    this: FeaturesStore,
    payload: { feature: EditableFeature; textPlacement: TextPlacement },
    dispatcher: ActionDispatcher
) {
    const { feature, textPlacement } = payload
    const selectedFeature = getEditableFeatureWithId(
        this.selectedEditableFeatures,
        feature.id
    )
    const wantedPlacement = Object.values(TextPlacement).find(
        (position) => position === textPlacement
    )
    if (wantedPlacement && selectedFeature && selectedFeature.isEditable) {
        selectedFeature.textPlacement = textPlacement
    }
}
