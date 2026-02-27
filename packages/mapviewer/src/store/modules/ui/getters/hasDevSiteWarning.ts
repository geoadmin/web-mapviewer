import { NO_WARNING_BANNER_HOSTNAMES } from '@swissgeo/staging-config/constants'

import type { UIStore } from '@/store/modules/ui/types'

export default function hasDevSiteWarning(this: UIStore): boolean {
    return (
        !this.forceNoDevSiteWarning &&
        !NO_WARNING_BANNER_HOSTNAMES.some((hostname) => this.hostname.includes(hostname))
    )
}
