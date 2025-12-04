import type { UIStore } from '@/store/modules/ui/types'

import { BREAKPOINT_TABLET } from '@/config/responsive.config'

export default function isTabletSize(this: UIStore): boolean {
    return this.isDesktopMode && this.width < BREAKPOINT_TABLET
}
