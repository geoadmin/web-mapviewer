import type { UIStore } from '@/store/modules/ui/types/ui'

import { UIModes } from '@/store/modules/ui/types/uiModes.enum'

export default function isDesktopMode(this: UIStore): boolean {
    return this.mode === UIModes.Desktop
}
