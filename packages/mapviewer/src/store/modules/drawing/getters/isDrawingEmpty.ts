import type { DrawingStore } from '@/store/modules/drawing/types'

export function isDrawingEmpty(this: DrawingStore): boolean {
    return this.feature.all.length === 0
}
