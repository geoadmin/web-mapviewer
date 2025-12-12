import type { LayersStore } from '@/store/modules/layers/types'
import type { ActionDispatcher } from '@/store/types'

export default function setPreviewYear(
    this: LayersStore,
    year: number | undefined,
    dispatcher: ActionDispatcher
) {
    this.previewYear = year
}
