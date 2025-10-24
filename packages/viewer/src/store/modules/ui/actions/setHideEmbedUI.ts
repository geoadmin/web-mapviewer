import type { UIStore } from '@/store/modules/ui/types/ui'
import type { ActionDispatcher } from '@/store/types'

export default function setHideEmbedUI(
    this: UIStore,
    hideEmbedUI: boolean,
    dispatcher: ActionDispatcher
): void {
    this.hideEmbedUI = !!hideEmbedUI
}
