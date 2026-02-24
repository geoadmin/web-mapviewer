import type { EditableFeature } from '@swissgeo/api'

export default function getEditableFeatureWithId(
    selectedEditableFeatures: EditableFeature[],
    featureId: string | number
): EditableFeature | undefined {
    return selectedEditableFeatures.find((selectedFeature) => selectedFeature.id === featureId)
}
