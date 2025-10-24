import type { Geometry } from 'geojson'

import type { EditableFeature } from '@/api/features.api'
import type { FeaturesStore } from '@/store/modules/features/types/features'
import type { ActionDispatcher } from '@/store/types'

import getEditableFeatureWithId from '@/store/modules/features/utils/getEditableFeatureWithId'
import useProfileStore from '@/store/modules/profile'

export default function changeFeatureGeometry(
    this: FeaturesStore,
    feature: EditableFeature,
    geometry: Geometry,
    dispatcher: ActionDispatcher
) {
    const selectedFeature = getEditableFeatureWithId(this.selectedEditableFeatures, feature.id)
    if (selectedFeature && selectedFeature.isEditable && geometry) {
        selectedFeature.geometry = geometry
        const profileStore = useProfileStore()
        profileStore.setProfileFeature(selectedFeature, dispatcher)
    }
}
