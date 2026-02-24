import type { UIStore } from '@/store/modules/ui/types'
import type { ActionDispatcher } from '@/store/types'

export default function setLoadingBarRequester(
    this: UIStore,
    requester: string,
    dispatcher: ActionDispatcher
): void {
    this.setShowLoadingBar(true, requester, dispatcher)
}
