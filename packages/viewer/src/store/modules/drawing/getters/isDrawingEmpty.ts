import type { DrawingStore } from '@/store/modules/drawing/types/drawing'

export function isDrawingEmpty(this: DrawingStore): boolean {
    return this.feature.all.length === 0
}
