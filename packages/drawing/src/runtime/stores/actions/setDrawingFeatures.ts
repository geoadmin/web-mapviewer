import type { EditableFeature } from '@swissgeo/api'
import type { DrawingStore, ActionDispatcher } from '~/types/drawingStore'

export default function setDrawingFeatures(
    this: DrawingStore,
    features: EditableFeature[],
    dispatcher: ActionDispatcher
) {
    this.feature.all = [...features]
}
