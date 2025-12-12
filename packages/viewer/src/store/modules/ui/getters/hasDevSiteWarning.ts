import type { UIStore } from '@/store/modules/ui/types'

import { NO_WARNING_BANNER_HOSTNAMES } from '@/config/staging.config'

export default function hasDevSiteWarning(this: UIStore): boolean {
    return (
        !this.forceNoDevSiteWarning &&
        !NO_WARNING_BANNER_HOSTNAMES.some((hostname) => this.hostname.includes(hostname))
    )
}
