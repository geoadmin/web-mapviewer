import type { DrawingStore } from '@/store/modules/drawing/types'

import { OnlineMode } from '@/store/modules/drawing/types/OnlineMode.enum'

export default function showNotSharedDrawingWarning(this: DrawingStore): boolean {
    return (
        !this.isVisitWithAdminId &&
        !this.isDrawingEditShared &&
        this.isDrawingModified &&
        !(this.onlineMode === OnlineMode.Offline || this.onlineMode === OnlineMode.OfflineWhileOnline)
    )
}
