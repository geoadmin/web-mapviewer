import type { DrawingStore } from '~/types/drawingStore'

export default function isDrawingEmpty(this: DrawingStore): boolean {
    return this.feature.all.length === 0
}
