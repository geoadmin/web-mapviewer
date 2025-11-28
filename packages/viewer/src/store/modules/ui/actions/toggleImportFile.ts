import type { UIStore } from '@/store/modules/ui/types/ui'
import type { ActionDispatcher } from '@/store/types'

export default function toggleImportFile(this: UIStore, dispatcher: ActionDispatcher): void {
    this.importFile = !this.importFile
}
