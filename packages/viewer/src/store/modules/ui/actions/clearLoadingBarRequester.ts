import type { UIStore } from '@/store/modules/ui/types/ui'
import type { ActionDispatcher } from '@/store/types'

export default function clearLoadingBarRequester(
    this: UIStore,
    requester: string,
    dispatcher: ActionDispatcher
): void {
    this.setShowLoadingBar(false, requester, dispatcher)
}
