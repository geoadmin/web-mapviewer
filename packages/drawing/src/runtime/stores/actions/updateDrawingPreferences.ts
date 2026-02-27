import type { DrawingPreferences, DrawingStore, ActionDispatcher } from '~/types/drawingStore'

export default function updateDrawingPreferences(
    this: DrawingStore,
    preferences: Partial<DrawingPreferences>,
    dispatcher: ActionDispatcher
) {
    Object.assign(this.edit.preferred, preferences)
}
