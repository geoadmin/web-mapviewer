import type { ActionDispatcher, DrawingDebugConfig, DrawingStore } from '~/types/drawingStore'

export default function setDrawingDebugConfig(
    this: DrawingStore,
    config: DrawingDebugConfig,
    dispatcher: ActionDispatcher
) {
    this.debug = config
}
