import type { DrawingPreferences, DrawingStore } from '@/store/modules/drawing/types/drawing'
import type { ActionDispatcher } from '@/store/types'

export default function updateDrawingPreferences(
    this: DrawingStore,
    preferences: Partial<DrawingPreferences>,
    dispatcher: ActionDispatcher
) {
    Object.assign(this.edit.preferred, preferences)
}
