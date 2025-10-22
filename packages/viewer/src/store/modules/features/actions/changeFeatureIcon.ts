import type { DrawingIcon } from '@/api/icon.api'
import type { FeaturesStore } from '@/store/modules/features/types/features'
import type { ActionDispatcher } from '@/store/types'

import { type EditableFeature, EditableFeatureTypes } from '@/api/features.api'
import getEditableFeatureWithId from '@/store/modules/features/utils/getEditableFeatureWithId'

/**
 * Changes the icon of the feature. Only change the icon if:
 *
 * - The feature is editable
 * - Part of the currently selected feature
 * - Is a marker type feature
 * - The given icon is valid (non-null)
 */
export default function changeFeatureIcon(
    this: FeaturesStore,
    feature: EditableFeature,
    icon: DrawingIcon,
    dispatcher: ActionDispatcher
) {
    const selectedFeature = getEditableFeatureWithId(this.selectedEditableFeatures, feature.id)
    if (
        icon &&
        selectedFeature &&
        selectedFeature.isEditable &&
        selectedFeature.featureType === EditableFeatureTypes.Marker
    ) {
        selectedFeature.icon = icon
    }
}
