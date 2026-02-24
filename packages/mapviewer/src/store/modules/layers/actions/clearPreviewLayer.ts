import type { LayersStore } from '@/store/modules/layers/types'
import type { ActionDispatcher } from '@/store/types'

export default function clearPreviewLayer(this: LayersStore, dispatcher: ActionDispatcher) {
    this.setPreviewLayer(undefined, dispatcher)
}
