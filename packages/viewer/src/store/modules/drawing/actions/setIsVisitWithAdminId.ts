import type { DrawingStore } from '@/store/modules/drawing/types/drawing'
import type { ActionDispatcher } from '@/store/types'

export default function setIsVisitWithAdminId(
    this: DrawingStore,
    isVisitingWithAdminId: boolean,
    dispatcher: ActionDispatcher
) {
    this.isVisitWithAdminId = isVisitingWithAdminId
}
