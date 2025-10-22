import type { DrawingStore } from '@/store/modules/drawing/types/drawing'
import type { ActionDispatcher } from '@/store/types'

export default function addDrawingFeature(
    this: DrawingStore,
    featureId: string,
    dispatcher: ActionDispatcher
) {
    this.featureIds.push(featureId)
}
