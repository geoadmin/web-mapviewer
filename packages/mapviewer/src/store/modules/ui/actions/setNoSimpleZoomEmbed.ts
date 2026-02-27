import type { UIStore } from '@/store/modules/ui/types'
import type { ActionDispatcher } from '@/store/types'

export default function setNoSimpleZoomEmbed(
    this: UIStore,
    noSimpleZoomEmbed: boolean,
    dispatcher: ActionDispatcher
): void {
    this.noSimpleZoomEmbed = !!noSimpleZoomEmbed
}
