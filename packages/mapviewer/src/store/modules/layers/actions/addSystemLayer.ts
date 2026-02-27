import type { Layer } from '@swissgeo/layers'

import log, { LogPreDefinedColor } from '@swissgeo/log'

import type { LayersStore } from '@/store/modules/layers/types'
import type { ActionDispatcher } from '@/store/types'

/**
 * Add a system layer
 *
 * NOTE: unlike the activeLayers, systemLayers cannot have duplicates, and they are added/removed by
 * ID (instead of by index)
 */
export default function addSystemLayer(
    this: LayersStore,
    layer: Layer,
    dispatcher: ActionDispatcher
) {
    if (this.systemLayers.find((systemLayer) => systemLayer.id === layer.id)) {
        log.error({
            title: 'Layers store / addSystemLayer',
            titleColor: LogPreDefinedColor.Red,
            messages: ['Failed to add system layer: duplicate layer ID', layer, dispatcher],
        })
    } else {
        this.systemLayers.push(layer)
    }
}
