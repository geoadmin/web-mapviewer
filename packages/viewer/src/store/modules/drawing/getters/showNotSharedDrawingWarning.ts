import type { DrawingStore } from '@/store/modules/drawing/types/drawing'

export default function showNotSharedDrawingWarning(this: DrawingStore): boolean {
    return (
        !this.isVisitWithAdminId &&
        !this.isDrawingEditShared &&
        this.isDrawingModified &&
        this.online
    )
}
