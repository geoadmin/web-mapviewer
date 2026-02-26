import log, { LogPreDefinedColor } from '@swissgeo/log'

import type { LayersStore } from '@/store/modules/layers/types'
import type { ActionDispatcher } from '@/store/types'

export default function moveActiveLayerToIndex(
    this: LayersStore,
    index: number,
    newIndex: number,
    dispatcher: ActionDispatcher
) {
    if (newIndex >= this.activeLayers.length || newIndex < 0) {
        log.error({
            title: 'Layers store / moveActiveLayerToIndex',
            titleColor: LogPreDefinedColor.Red,
            messages: [
                'Failed to moveActiveLayerToIndex: invalid new index',
                newIndex,
                index,
                dispatcher,
            ],
        })
        return
    }
    const activeLayer = this.getActiveLayerByIndex(index)
    if (!activeLayer) {
        log.error({
            title: 'Layers store / moveActiveLayerToIndex',
            titleColor: LogPreDefinedColor.Red,
            messages: ['Failed to moveActiveLayerToIndex: invalid index, no layer found', index],
        })
        return
    }
    const removed = this.activeLayers.splice(index, 1)
    if (removed.length > 0) {
        this.activeLayers.splice(newIndex, 0, removed[0])
    }
}
