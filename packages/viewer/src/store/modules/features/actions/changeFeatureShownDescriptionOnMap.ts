import type { EditableFeature } from '@/api/features.api'
import type { FeaturesStore } from '@/store/modules/features/types/features'
import type { ActionDispatcher } from '@/store/types'

import getEditableFeatureWithId from '@/store/modules/features/utils/getEditableFeatureWithId'

export default function changeFeatureShownDescriptionOnMap(
    this: FeaturesStore,
    payload: { feature: EditableFeature; showDescriptionOnMap: boolean },
    dispatcher: ActionDispatcher
) {
    const { feature, showDescriptionOnMap } = payload
    const selectedFeature = getEditableFeatureWithId(this.selectedEditableFeatures, feature.id)
    if (selectedFeature && selectedFeature.isEditable) {
        selectedFeature.showDescriptionOnMap = showDescriptionOnMap
    }
}
