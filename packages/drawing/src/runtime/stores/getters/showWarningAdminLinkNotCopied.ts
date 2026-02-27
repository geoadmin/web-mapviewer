import type { DrawingStore } from '~/types/drawingStore'

export default function showWarningAdminLinkNotCopied(this: DrawingStore): boolean {
    return this.online && !this.share.hasAdminLinkBeenCopied
}
