import type { DrawingStore } from '@/store/modules/drawing/types/drawing'
import type { ActionDispatcher } from '@/store/types'

import { EditableFeatureTypes } from '@/api/features.api'

export default function setDrawingMode(
    this: DrawingStore,
    mode: EditableFeatureTypes | undefined,
    dispatcher: ActionDispatcher
) {
    this.mode = mode
}
