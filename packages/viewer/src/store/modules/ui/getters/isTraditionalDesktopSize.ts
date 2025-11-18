import type { UIStore } from '@/store/modules/ui/types/ui'

import { BREAKPOINT_TABLET } from '@/config/responsive.config'

export default function isTraditionalDesktopSize(this: UIStore): boolean {
    return this.isDesktopMode && this.width >= BREAKPOINT_TABLET
}
