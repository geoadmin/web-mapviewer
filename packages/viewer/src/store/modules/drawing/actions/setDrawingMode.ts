import type { EditableFeatureTypes } from '@/api/features.api'
import type { DrawingStore } from '@/store/modules/drawing/types/drawing'
import type { ActionDispatcher } from '@/store/types'

export default function setDrawingMode(
    this: DrawingStore,
    mode: EditableFeatureTypes | undefined,
    dispatcher: ActionDispatcher
) {
    this.edit.featureType = mode
}
