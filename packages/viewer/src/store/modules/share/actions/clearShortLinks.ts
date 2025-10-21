import type { ShareStore } from '@/store/modules/share/types/share'
import type { ActionDispatcher } from '@/store/types'

export default function clearShortLinks(
    this: ShareStore,
    dispatcher: ActionDispatcher
): void {
    this.shortLink = undefined
}
