import type { UIStore } from '@/store/modules/ui/types'
import type { ActionDispatcher } from '@/store/types'

export default function setShowDisclaimer(
    this: UIStore,
    showDisclaimer: boolean,
    dispatcher: ActionDispatcher
): void {
    this.showDisclaimer = !!showDisclaimer
}
