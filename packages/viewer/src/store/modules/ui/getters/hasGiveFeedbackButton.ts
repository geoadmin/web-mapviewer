import type { UIStore } from '@/store/modules/ui/types'

import { GIVE_FEEDBACK_HOSTNAMES } from '@/config/staging.config'

export default function hasGiveFeedbackButton(this: UIStore): boolean {
    return GIVE_FEEDBACK_HOSTNAMES.some((hostname) => this.hostname.includes(hostname))
}
