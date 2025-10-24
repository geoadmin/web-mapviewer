import type { Layer } from '@swissgeo/layers'

import { layerUtils } from '@swissgeo/layers/utils'

import type { LayersStore } from '@/store/modules/layers/types/layers'
import type { ActionDispatcher } from '@/store/types'

/**
 * Sets the list of active layers. This replaces the existing list.
 *
 * NOTE: the layer array is automatically deep cloned
 */
export default function setLayers(
    this: LayersStore,
    layers: Layer[],
    dispatcher: ActionDispatcher
) {
    this.activeLayers = layers.map((layer) => layerUtils.cloneLayer(layer))
}
