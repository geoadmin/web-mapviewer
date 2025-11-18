import type { UIStore } from '@/store/modules/ui/types/ui'
import type { ActionDispatcher } from '@/store/types'

export default function setCompareSliderActive(
    this: UIStore,
    isActive: boolean,
    dispatcher: ActionDispatcher
): void {
    this.isCompareSliderActive = isActive
}
