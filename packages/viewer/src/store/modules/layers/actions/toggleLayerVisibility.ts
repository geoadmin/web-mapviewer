import log, { LogPreDefinedColor } from '@swissgeo/log'

import type { LayersStore } from '@/store/modules/layers/types/layers'
import type { ActionDispatcher } from '@/store/types'

/**
 * Toggle the layer visibility of the layer corresponding to this index, in the active layer
 * list
 */
export default function toggleLayerVisibility(
    this: LayersStore,
    index: number,
    dispatcher: ActionDispatcher
) {
    const layer = this.getActiveLayerByIndex(index)
    if (layer) {
        layer.isVisible = !layer.isVisible
    } else {
        log.error({
            title: 'Layers store / toggleLayerVisibility',
            titleColor: LogPreDefinedColor.Red,
            messages: ['Failed to toggleLayerVisibility: invalid index', index, dispatcher],
        })
    }
}
