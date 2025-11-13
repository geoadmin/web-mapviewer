import type { UIStore } from '@/store/modules/ui/types/ui'
import type { ActionDispatcher } from '@/store/types'

export default function setEmbed(
    this: UIStore,
    embed: boolean,
    dispatcher: ActionDispatcher
): void {
    this.embed = embed
}
