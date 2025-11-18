import type { Layer } from '@swissgeo/layers'

import log, { LogPreDefinedColor } from '@swissgeo/log'

import type { LayersStore } from '@/store/modules/layers/types/layers'
import type { ActionDispatcher } from '@/store/types'

export default function updateLayer<T extends Layer>(
    this: LayersStore,
    index: number,
    values: Partial<T>,
    dispatcher: ActionDispatcher
): void
export default function updateLayer<T extends Layer>(
    this: LayersStore,
    layerId: string,
    values: Partial<T>,
    dispatcher: ActionDispatcher
): void
export default function updateLayer<T extends Layer>(
    this: LayersStore,
    layer: T,
    values: Partial<T>,
    dispatcher: ActionDispatcher
): void

/**
 * Full or partial update of an active layer found at the index, or the first active layer matching
 * the ID
 */
export default function updateLayer<T extends Layer>(
    this: LayersStore,
    input: string | number | T,
    values: Partial<T>,
    dispatcher: ActionDispatcher
) {
    let layerId: string | undefined
    if (typeof input === 'string') {
        layerId = input
    } else if (typeof input === 'number') {
        layerId = this.getActiveLayerByIndex(input)?.id
    } else {
        layerId = input.id
    }
    if (!layerId) {
        log.error({
            title: 'Layers store / updateLayer',
            titleColor: LogPreDefinedColor.Red,
            messages: [
                'Failed to update layer: invalid input (no matching active layer found)',
                input,
                dispatcher,
            ],
        })
    }
    const layer2Update = this.activeLayers.find((layer) => layer.id === layerId)
    if (layer2Update) {
        Object.assign(layer2Update, values)
    } else {
        log.error({
            title: 'Layers store / updateLayer',
            titleColor: LogPreDefinedColor.Red,
            messages: [
                'Failed to update layer: invalid layerId (no matching active layer found)',
                layerId,
                dispatcher,
            ],
        })
    }
}
