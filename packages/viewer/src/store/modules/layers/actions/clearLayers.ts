import type { LayersStore } from '@/store/modules/layers/types/layers'
import type { ActionDispatcher } from '@/store/types'

import { identifyFeatures } from '@/store/modules/layers/utils/identifyFeatures'

export default function clearLayers(this: LayersStore, dispatcher: ActionDispatcher) {
    this.activeLayers = []
    identifyFeatures.call(this, undefined, { this: this }, dispatcher)
}