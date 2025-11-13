import type { EditableFeature } from '@/api/features.api'

export default function getEditableFeatureWithId(
    selectedEditableFeatures: EditableFeature[],
    featureId: string | number
): EditableFeature | undefined {
    return selectedEditableFeatures.find((selectedFeature) => selectedFeature.id === featureId)
}
