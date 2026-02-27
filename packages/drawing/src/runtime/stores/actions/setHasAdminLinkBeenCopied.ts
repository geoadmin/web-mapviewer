import type { ActionDispatcher, DrawingStore } from '~/types/drawingStore'

export default function setHasAdminLinkBeenCopied(
    this: DrawingStore,
    hasBeenCopied: boolean,
    dispatcher: ActionDispatcher
) {
    this.share.hasAdminLinkBeenCopied = hasBeenCopied
}
