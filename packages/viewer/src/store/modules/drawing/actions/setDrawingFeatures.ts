import type { DrawingStore } from '@/store/modules/drawing/types/drawing'
import type { ActionDispatcher } from '@/store/types'

export default function setDrawingFeatures(
    this: DrawingStore,
    featureIds: string[],
    dispatcher: ActionDispatcher
) {
    this.featureIds = [...featureIds]
}
