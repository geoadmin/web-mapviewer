import type { DrawingStore } from '@/store/modules/drawing/types/drawing'

import { DrawingSaveState } from '@/store/modules/drawing/types/DrawingSaveState.enum'

export default function isDrawingModified(this: DrawingStore): boolean {
    return (
        this.save.state !== DrawingSaveState.Initial &&
        this.save.state !== DrawingSaveState.Loaded &&
        this.save.state !== DrawingSaveState.LoadError
    )
}
