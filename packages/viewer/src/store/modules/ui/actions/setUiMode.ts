import type { UIStore } from '@/store/modules/ui/types'
import type { UIMode } from '@/store/modules/ui/types'
import type { ActionDispatcher } from '@/store/types'

export default function setUiMode(this: UIStore, mode: UIMode, dispatcher: ActionDispatcher): void {
    this.mode = mode
    this.fullscreenMode = false
}
