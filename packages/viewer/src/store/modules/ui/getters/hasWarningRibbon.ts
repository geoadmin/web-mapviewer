import type { UIStore } from '@/store/modules/ui/types'

import { WARNING_RIBBON_HOSTNAMES } from '@/config/staging.config'

export default function hasWarningRibbon(this: UIStore): boolean {
    return WARNING_RIBBON_HOSTNAMES.some((hostname) => this.hostname.includes(hostname))
}
