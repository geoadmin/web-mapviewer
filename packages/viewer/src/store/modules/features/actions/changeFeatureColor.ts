import type { EditableFeature } from '@/api/features.api'
import type { FeaturesStore } from '@/store/modules/features/types/features'
import type { ActionDispatcher } from '@/store/types'

import getEditableFeatureWithId from '@/store/modules/features/utils/getEditableFeatureWithId'
import { allStylingColors, type FeatureStyleColor } from '@/utils/featureStyleUtils'

/**
 * Changes the color used to fill the feature. Only change the color if the feature is
 * editable, part of the currently selected features and that the given color is a valid
 * color from {@link FeatureStyleColor}
 */
export default function changeFeatureColor(
    this: FeaturesStore,
    payload: { feature: EditableFeature; color: FeatureStyleColor },
    dispatcher: ActionDispatcher
) {
    const { feature, color } = payload
    const selectedFeature = getEditableFeatureWithId(
        this.selectedEditableFeatures,
        feature.id
    )
    const wantedColor = allStylingColors.find(
        (styleColor) => styleColor.name === color.name
    )
    if (wantedColor && selectedFeature && selectedFeature.isEditable) {
        selectedFeature.fillColor = color
    }
}
