import type { ShareStore } from '@/store/modules/share/types/share'
import type { ActionDispatcher } from '@/store/types'

export default function closeShareMenuAndRemoveShortLinks(
    this: ShareStore,
    dispatcher: ActionDispatcher
): void {
    this.setIsMenuSectionShown(false, dispatcher)
    this.clearShortLinks(dispatcher)
}
