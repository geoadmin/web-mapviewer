import type { Layer } from '@swissgeo/layers'
import type { ErrorMessage } from '@swissgeo/log/Message'

import { addErrorMessageToLayer } from '@swissgeo/layers'
import { layerUtils } from '@swissgeo/layers/utils'
import log, { LogPreDefinedColor } from '@swissgeo/log'

import type { LayerActionFilter, LayersStore } from '@/store/modules/layers/types/layers'
import type { ActionDispatcher } from '@/store/types'

export default function addLayerError(
    this: LayersStore,
    layer: Layer | string,
    error: ErrorMessage,
    action: ActionDispatcher
): void
export default function addLayerError(
    this: LayersStore,
    layer: Layer | string,
    options: LayerActionFilter,
    error: ErrorMessage,
    action: ActionDispatcher
): void

/**
 * Add a layer error translation key.
 *
 * NOTE: This set the error key to all layers matching the ID, isExternal, and baseUrl properties.
 */
export default function addLayerError(
    this: LayersStore,
    layerOrLayerId: Layer | string,
    optionsOrError: LayerActionFilter | ErrorMessage,
    errorOrDispatcher: ErrorMessage | ActionDispatcher,
    dispatcherOrNothing?: ActionDispatcher
): void {
    const options = dispatcherOrNothing ? (optionsOrError as LayerActionFilter) : {}
    const error = dispatcherOrNothing
        ? (errorOrDispatcher as ErrorMessage)
        : (optionsOrError as ErrorMessage)
    const dispatcher = dispatcherOrNothing
        ? dispatcherOrNothing
        : (errorOrDispatcher as ActionDispatcher)

    const matchingLayers: Layer[] = []
    if (typeof layerOrLayerId === 'string') {
        matchingLayers.push(...this.getLayersById(layerOrLayerId, options))
    } else {
        matchingLayers.push(layerOrLayerId)
    }
    if (matchingLayers.length === 0) {
        log.error({
            title: 'Layers store / addLayerError',
            titleColor: LogPreDefinedColor.Red,
            messages: [
                'Failed to add layer error: invalid layerId (no matching layer found)',
                layerOrLayerId,
                options,
            ],
        })
        return
    }
    const updatedLayers = matchingLayers.map((layer) => {
        const clone = layerUtils.cloneLayer(layer)
        addErrorMessageToLayer(clone, error)
        if (clone.isLoading) {
            clone.isLoading = false
        }
        return clone
    })
    this.updateLayers(updatedLayers, dispatcher)
}
