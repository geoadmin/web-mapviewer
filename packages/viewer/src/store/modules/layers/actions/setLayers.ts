import type { Layer } from '@swissgeo/layers'

import { layerUtils } from '@swissgeo/layers/utils'

import type { LayersStore } from '@/store/modules/layers/types/layers'
import type { ActionDispatcher } from '@/store/types'

import afterAddOperations from '@/store/modules/layers/utils/afterAddOperations'
import rerunSearchLayerSearchable from '@/store/modules/layers/utils/rerunSearchLayerSearchable'

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
    const clones = layers.map((layer) => layerUtils.cloneLayer(layer))
    this.activeLayers = clones
    clones.forEach((layer) => afterAddOperations(layer, dispatcher))
    rerunSearchLayerSearchable(clones)
}
