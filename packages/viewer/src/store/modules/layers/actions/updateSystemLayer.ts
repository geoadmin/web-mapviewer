import type { Layer } from '@swissgeo/layers'

import log, { LogPreDefinedColor } from '@swissgeo/log'

import type { LayersStore } from '@/store/modules/layers/types'
import type { ActionDispatcher } from '@/store/types'

export default function updateSystemLayer(
    this: LayersStore,
    layer: Partial<Layer>,
    dispatcher: ActionDispatcher
) {
    const layer2Update = this.systemLayers.find((systemLayer) => systemLayer.id === layer.id)
    if (!layer2Update) {
        log.error({
            title: 'Layers store / updateSystemLayer',
            titleColor: LogPreDefinedColor.Red,
            messages: [
                'Failed to update system layer: invalid layerId (no matching layer found)',
                layer,
                dispatcher,
            ],
        })
        return
    }
    Object.assign(layer2Update, layer)
}
