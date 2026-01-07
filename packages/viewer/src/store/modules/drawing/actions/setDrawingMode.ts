import type { EditableFeatureTypes } from '@swissgeo/api'

import type { DrawingStore } from '@/store/modules/drawing/types'
import type { ActionDispatcher } from '@/store/types'

export default function setDrawingMode(
    this: DrawingStore,
    mode: EditableFeatureTypes | undefined,
    dispatcher: ActionDispatcher
) {
    this.edit.featureType = mode
}
