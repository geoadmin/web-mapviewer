import type { UIStore } from '@/store/modules/ui/types/ui'
import type { ActionDispatcher } from '@/store/types'

export default function setForceNoDevSiteWarning(this: UIStore, dispatcher: ActionDispatcher): void {
    this.forceNoDevSiteWarning = true
}
