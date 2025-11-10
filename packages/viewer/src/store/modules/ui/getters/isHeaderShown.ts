import type { UIStore } from '@/store/modules/ui/types/ui'

import useDrawingStore from '@/store/modules/drawing'

export default function isHeaderShown(this: UIStore): boolean {
    const drawingStore = useDrawingStore()
    return !this.fullscreenMode && !drawingStore.overlay.show
}
