import type { DrawingStore } from '@/store/modules/drawing/types'
import type { ActionDispatcher } from '@/store/types'

export default function clearDrawingFeatures(this: DrawingStore, dispatcher: ActionDispatcher) {
    this.feature.all = []
    this.feature.current = undefined
    this.save.state = 'INITIAL'
}
