import type { MapStore } from '@/store/modules/map/types/map'
import type { ActionDispatcher } from '@/store/types'

export default function clearPreviewPinnedLocation(
    this: MapStore,
    dispatcher: ActionDispatcher
): void {
    this.previewedPinnedLocation = undefined
}
