import type { UIStore } from '@/store/modules/ui/types'

import { UIModes } from '@/store/modules/ui/types'

export default function isDesktopMode(this: UIStore): boolean {
    return this.mode === UIModes.Desktop
}
