import type { LayersStore } from '@/store/modules/layers/types/layers'
import type { ActionDispatcher } from '@/store/types'

export default function clearPreviewLayer(this: LayersStore, dispatcher: ActionDispatcher) {
    this.previewLayer = undefined
}
