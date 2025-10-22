import type { UIStore } from '@/store/modules/ui/types/ui'

import { REPORT_PROBLEM_HOSTNAMES } from '@/config/staging.config'

export default function hasReportProblemButton(this: UIStore): boolean {
    return REPORT_PROBLEM_HOSTNAMES.some((hostname) => this.hostname.includes(hostname))
}
