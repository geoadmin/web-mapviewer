import log, { LogPreDefinedColor } from '@swissgeo/log'

import type { LayersStore } from '@/store/modules/layers/types'
import type { ActionDispatcher } from '@/store/types'

/**
 * Remove a system layer
 *
 * NOTE: unlike the activeLayers, systemLayers cannot have duplicates, and they are added/removed by
 * ID (instead of by index)
 */
export default function removeSystemLayer(
    this: LayersStore,
    layerId: string,
    dispatcher: ActionDispatcher
) {
    const index = this.systemLayers.findIndex((systemLayer) => systemLayer.id === layerId)
    if (index === -1) {
        log.warn({
            title: 'Layers store / removeSystemLayer',
            titleColor: LogPreDefinedColor.Yellow,
            messages: [
                'Failed to remove system layer: invalid layerId (no matching layer found)',
                layerId,
                dispatcher,
            ],
        })
    } else {
        this.systemLayers.splice(index, 1)
    }
}
