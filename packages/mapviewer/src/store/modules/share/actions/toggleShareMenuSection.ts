import type { ShareStore } from '@/store/modules/share/types'
import type { ActionDispatcher } from '@/store/types'

export default function toggleShareMenuSection(
    this: ShareStore,
    dispatcher: ActionDispatcher
): void {
    this.setIsMenuSectionShown(!this.isMenuSectionShown, dispatcher)
}
