import log, { LogPreDefinedColor } from '@swissgeo/log'

import type { LayersStore } from '@/store/modules/layers/types/layers'
import type { ActionDispatcher } from '@/store/types'

export default function setLayerOpacity(
    this: LayersStore,
    index: number,
    opacity: number,
    dispatcher: ActionDispatcher
) {
    const layer = this.getActiveLayerByIndex(index)
    if (layer) {
        layer.opacity = opacity
    } else {
        log.error({
            title: 'Layers store / setLayerOpacity',
            titleColor: LogPreDefinedColor.Red,
            messages: ['Failed to setLayerOpacity: invalid index', index, dispatcher],
        })
    }
}
