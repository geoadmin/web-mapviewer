import type { FeaturesStore } from '@/store/modules/features/types/features'
import type { ActionDispatcher } from '@/store/types'

import { type EditableFeature, EditableFeatureTypes } from '@/api/features.api'
import getEditableFeatureWithId from '@/store/modules/features/utils/getEditableFeatureWithId'
import { allStylingSizes, type FeatureStyleSize } from '@/utils/featureStyleUtils'

/**
 * Changes the icon size of the feature. Only change the icon size if:
 *
 * - The feature is editable
 * - Part of the currently selected features
 * - Is a marker type feature
 * - The given size is a valid size from {@link FeatureStyleSize}
 */
export default function changeFeatureIconSize(
    this: FeaturesStore,
    payload: { feature: EditableFeature; iconSize: FeatureStyleSize },
    dispatcher: ActionDispatcher
) {
    const { feature, iconSize } = payload
    const selectedFeature = getEditableFeatureWithId(this.selectedEditableFeatures, feature.id)
    const wantedSize = allStylingSizes.find((size) => size.textScale === iconSize.textScale)
    if (
        wantedSize &&
        selectedFeature &&
        selectedFeature.isEditable &&
        selectedFeature.featureType === EditableFeatureTypes.Marker
    ) {
        selectedFeature.iconSize = iconSize
    }
}
