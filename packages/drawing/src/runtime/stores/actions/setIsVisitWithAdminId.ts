import type { DrawingStore, ActionDispatcher } from '~/types/drawingStore'

export default function setIsVisitWithAdminId(
    this: DrawingStore,
    isVisitingWithAdminId: boolean,
    dispatcher: ActionDispatcher
) {
    this.isVisitWithAdminId = isVisitingWithAdminId
}
