import type { EditableFeature } from '@/api/features.api'
import type { DrawingStore } from '@/store/modules/drawing/types/drawing'
import type { ActionDispatcher } from '@/store/types'

export default function setDrawingFeatures(
    this: DrawingStore,
    features: EditableFeature[],
    dispatcher: ActionDispatcher
) {
    this.feature.all = [...features]
}
