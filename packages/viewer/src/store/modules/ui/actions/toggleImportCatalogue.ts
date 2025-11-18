import type { UIStore } from '@/store/modules/ui/types/ui'
import type { ActionDispatcher } from '@/store/types'

export default function toggleImportCatalogue(this: UIStore, dispatcher: ActionDispatcher): void {
    this.importCatalogue = !this.importCatalogue
}
