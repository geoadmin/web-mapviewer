import type { EditableFeatureTypes } from '@swissgeo/api'
import type { DrawingStore, ActionDispatcher } from '~/types/drawingStore'

export default function setDrawingMode(
    this: DrawingStore,
    mode: EditableFeatureTypes | undefined,
    dispatcher: ActionDispatcher
) {
    this.edit.featureType = mode
}
