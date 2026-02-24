import type { UIStore } from '@/store/modules/ui/types'
import type { ActionDispatcher } from '@/store/types'

export default function closeMenu(this: UIStore, dispatcher: ActionDispatcher): void {
    this.showMenu = false
}
