import type { DrawingStore } from '@/store/modules/drawing/types'

export default function showNotSharedDrawingWarning(this: DrawingStore): boolean {
    return (
        !this.isVisitWithAdminId &&
        !this.isDrawingEditShared &&
        this.isDrawingModified &&
        !(this.onlineMode === 'OFFLINE' || this.onlineMode === 'OFFLINE_WHILE_ONLINE')
    )
}
