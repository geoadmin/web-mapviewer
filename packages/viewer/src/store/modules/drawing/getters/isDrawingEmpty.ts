import type { DrawingStore } from '@/store/modules/drawing/types/drawing'

export function isDrawingEmpty(this: DrawingStore): boolean {
    return this.featureIds.length === 0
}
