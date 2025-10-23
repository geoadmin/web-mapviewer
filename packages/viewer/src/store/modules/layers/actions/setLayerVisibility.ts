import log, { LogPreDefinedColor } from '@swissgeo/log'

import type { LayersStore } from '@/store/modules/layers/types/layers'
import type { ActionDispatcher } from '@/store/types'

export default function setLayerVisibility(
    this: LayersStore,
    index: number,
    isVisible: boolean,
    dispatcher: ActionDispatcher
) {
    const layer = this.getActiveLayerByIndex(index)
    if (layer) {
        layer.isVisible = isVisible
    } else {
        log.error({
            title: 'Layers store / setLayerVisibility',
            titleColor: LogPreDefinedColor.Red,
            messages: ['Failed to setLayerVisibility: invalid index', index, dispatcher],
        })
    }
}
