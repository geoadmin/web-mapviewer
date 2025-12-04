import type { DrawingStore } from '@/store/modules/drawing/types'

export default function isDrawingModified(this: DrawingStore): boolean {
    return (
        this.save.state !== 'INITIAL' &&
        this.save.state !== 'LOADED' &&
        this.save.state !== 'LOAD_ERROR'
    )
}
