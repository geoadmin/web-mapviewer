import type { DrawingStore } from '@/store/modules/drawing/types'
import type { ActionDispatcher } from '@/store/types'

export default function setIsVisitWithAdminId(
    this: DrawingStore,
    isVisitingWithAdminId: boolean,
    dispatcher: ActionDispatcher
) {
    this.isVisitWithAdminId = isVisitingWithAdminId
}
