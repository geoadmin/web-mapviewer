import type { ShareStore } from '@/store/modules/share/types/share'
import type { ActionDispatcher } from '@/store/types'

export default function setShortLink(
    this: ShareStore,
    shortLink: string | undefined,
    dispatcher: ActionDispatcher
): void {
    this.shortLink = shortLink
}
