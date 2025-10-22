import type { SearchStore } from '@/store/modules/search/types/search'
import type { ActionDispatcher } from '@/store/types'

export default function setAutoSelect(
    this: SearchStore,
    autoSelect: boolean,
    dispatcher: ActionDispatcher
): void {
    this.autoSelect = autoSelect
}
