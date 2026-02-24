import { BREAKPOINT_TABLET } from '@swissgeo/staging-config/constants'

import type { UIStore } from '@/store/modules/ui/types'

export default function isTraditionalDesktopSize(this: UIStore): boolean {
    return this.isDesktopMode && this.width >= BREAKPOINT_TABLET
}
