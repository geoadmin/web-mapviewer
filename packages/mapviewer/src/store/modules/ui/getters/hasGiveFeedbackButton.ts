import { GIVE_FEEDBACK_HOSTNAMES } from '@swissgeo/staging-config/constants'

import type { UIStore } from '@/store/modules/ui/types'

export default function hasGiveFeedbackButton(this: UIStore): boolean {
    return GIVE_FEEDBACK_HOSTNAMES.some((hostname) => this.hostname.includes(hostname))
}
