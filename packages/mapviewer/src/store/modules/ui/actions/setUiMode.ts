import type { UIStore } from '@/store/modules/ui/types'
import type { ActionDispatcher } from '@/store/types'

import { UIModes } from '@/store/modules/ui/types'

export default function setUiMode(
    this: UIStore,
    mode: UIModes,
    dispatcher: ActionDispatcher
): void {
    if (mode in UIModes) {
        this.mode = mode
        this.fullscreenMode = false
    }
}
