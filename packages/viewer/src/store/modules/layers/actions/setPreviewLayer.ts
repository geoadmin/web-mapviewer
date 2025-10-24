import type { Layer } from '@swissgeo/layers'

import { layerUtils } from '@swissgeo/layers/utils'
import log, { LogPreDefinedColor } from '@swissgeo/log'

import type { LayersStore } from '@/store/modules/layers/types/layers'
import type { ActionDispatcher } from '@/store/types'

export default function setPreviewLayer(
    this: LayersStore,
    layer: Layer | string,
    dispatcher: ActionDispatcher
) {
    let clone
    if (typeof layer === 'object') {
        // got the layer, thus we copy it directly
        clone = layerUtils.cloneLayer(layer)
    } else {
        // got an ID, look for the layer
        const matchingLayer = this.getLayerConfigById(layer)
        if (matchingLayer) {
            clone = layerUtils.cloneLayer(matchingLayer)
        }
    }
    if (!clone) {
        log.error({
            title: 'Layers store / setPreviewLayer',
            titleColor: LogPreDefinedColor.Red,
            messages: [
                'Failed to setPreviewLayer: invalid layer identifier or layer object',
                layer,
                dispatcher,
            ],
        })
        return
    }
    clone.isVisible = true
    this.previewLayer = clone
}
