import type { SingleCoordinate } from '@swissgeo/coordinates'

import type { EditableFeature } from '@/api/features.api'
import type { FeaturesStore } from '@/store/modules/features/types/features'
import type { ActionDispatcher } from '@/store/types'

import getEditableFeatureWithId from '@/store/modules/features/utils/getEditableFeatureWithId'

/**
 * In drawing mode, informs the store about the new coordinates of the feature. (It does not move
 * the feature.) Only change the coordinates if the feature is editable and part of the currently
 * selected features.
 *
 * Coordinates is an array of coordinate. Marker and text feature have only one entry in this array
 * while line and measure store each points describing them in this coordinates array
 *
 * @param payload
 * @param payload.feature
 * @param payload.coordinates
 * @param dispatcher
 */
export default function changeFeatureCoordinates(
    this: FeaturesStore,
    payload: { feature: EditableFeature; coordinates: SingleCoordinate[] },
    dispatcher: ActionDispatcher
) {
    const { feature, coordinates } = payload
    const selectedFeature = getEditableFeatureWithId(this.selectedEditableFeatures, feature.id)
    if (selectedFeature && selectedFeature.isEditable && Array.isArray(coordinates)) {
        selectedFeature.coordinates = coordinates
    }
}
