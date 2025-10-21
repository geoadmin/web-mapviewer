import type { EditableFeature } from '@/api/features.api'
import type { FeaturesStore } from '@/store/modules/features/types/features'
import type { ActionDispatcher } from '@/store/types'

import getEditableFeatureWithId from '@/store/modules/features/utils/getEditableFeatureWithId'
import { allStylingSizes, type FeatureStyleSize } from '@/utils/featureStyleUtils'

/**
 * Changes the text size of the feature. Only change the text size if:
 *
 * - The feature is editable
 * - Part of the currently selected features
 * - The given size is a valid size from {@link FeatureStyleSize}
 */
export default function changeFeatureTextSize(
    this: FeaturesStore,
    payload: { feature: EditableFeature; textSize: FeatureStyleSize },
    dispatcher: ActionDispatcher
) {
    const { feature, textSize } = payload
    const selectedFeature = getEditableFeatureWithId(this.selectedEditableFeatures, feature.id)
    const wantedSize = allStylingSizes.find((size) => size.textScale === textSize.textScale)
    if (wantedSize && selectedFeature && selectedFeature.isEditable) {
        selectedFeature.textSize = textSize
    }
}
