import { WARNING_RIBBON_HOSTNAMES } from '@swissgeo/staging-config/constants'

import type { UIStore } from '@/store/modules/ui/types'

export default function hasWarningRibbon(this: UIStore): boolean {
    return WARNING_RIBBON_HOSTNAMES.some((hostname) => this.hostname.includes(hostname))
}
