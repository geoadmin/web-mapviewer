import type { EditableFeature } from '@/api/features/types'
import type { DrawingStore } from '@/store/modules/drawing/types'
import type { ActionDispatcher } from '@/store/types'

export default function setDrawingFeatures(
    this: DrawingStore,
    features: EditableFeature[],
    dispatcher: ActionDispatcher
) {
    this.feature.all = [...features]
}
