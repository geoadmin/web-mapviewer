import { REPORT_PROBLEM_HOSTNAMES } from '@swissgeo/staging-config/constants'

import type { UIStore } from '@/store/modules/ui/types'

export default function hasReportProblemButton(this: UIStore): boolean {
    return REPORT_PROBLEM_HOSTNAMES.some((hostname) => this.hostname.includes(hostname))
}
