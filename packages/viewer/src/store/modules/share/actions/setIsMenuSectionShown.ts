import type { ShareStore } from '@/store/modules/share/types'
import type { ActionDispatcher } from '@/store/types'

export default function setIsMenuSectionShown(
    this: ShareStore,
    show: boolean,
    dispatcher: ActionDispatcher
): void {
    this.isMenuSectionShown = show
}
