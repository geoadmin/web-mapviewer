import type { UIStore } from '@/store/modules/ui/types/ui'
import type { ActionDispatcher } from '@/store/types'

export default function setShowDisclaimer(
    this: UIStore,
    showDisclaimer: boolean,
    dispatcher: ActionDispatcher
): void {
    this.showDisclaimer = !!showDisclaimer
}
