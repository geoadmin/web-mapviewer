import type { UIStore } from '@/store/modules/ui/types'
import type { ActionDispatcher } from '@/store/types'

export default function setTimeSliderActive(
    this: UIStore,
    isActive: boolean,
    dispatcher: ActionDispatcher
): void {
    this.isTimeSliderActive = isActive
}
