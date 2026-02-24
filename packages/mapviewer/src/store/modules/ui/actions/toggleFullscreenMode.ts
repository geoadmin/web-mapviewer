import type { UIStore } from '@/store/modules/ui/types'
import type { ActionDispatcher } from '@/store/types'

export default function toggleFullscreenMode(this: UIStore, dispatcher: ActionDispatcher): void {
    this.fullscreenMode = !this.fullscreenMode
}
