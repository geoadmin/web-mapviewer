import type { UIStore } from '@/store/modules/ui/types'
import type { ActionDispatcher } from '@/store/types'

export default function setHeaderHeight(
    this: UIStore,
    height: number,
    dispatcher: ActionDispatcher
): void {
    this.headerHeight = height
}
