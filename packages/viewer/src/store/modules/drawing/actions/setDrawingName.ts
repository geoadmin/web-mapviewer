import type { DrawingStore } from '@/store/modules/drawing/types'
import type { ActionDispatcher } from '@/store/types'

export default function setDrawingName(
    this: DrawingStore,
    name: string,
    dispatcher: ActionDispatcher
) {
    this.name = name
}
