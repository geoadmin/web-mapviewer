import type { UIStore } from '@/store/modules/ui/types'

import { UIModes } from '@/store/modules/ui/types'

export default function isMenuTrayShown(this: UIStore): boolean {
    return this.mode === UIModes.Phone ? this.isMenuShown : this.isHeaderShown
}
