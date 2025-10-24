import type { UIStore } from '@/store/modules/ui/types/ui'
import type { ActionDispatcher } from '@/store/types'

export default function setShowDragAndDropOverlay(
    this: UIStore,
    showDragAndDropOverlay: boolean,
    dispatcher: ActionDispatcher
): void {
    this.showDragAndDropOverlay = !!showDragAndDropOverlay
}
