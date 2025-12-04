import type { UIStore } from '@/store/modules/ui/types'
import type { ActionDispatcher } from '@/store/types'

export default function setCompareRatio(
    this: UIStore,
    compareRatio: number,
    dispatcher: ActionDispatcher
): void {
    if (compareRatio > 0.0 && compareRatio < 1.0) {
        this.compareRatio = compareRatio
    } else {
        this.compareRatio = undefined
    }
}
