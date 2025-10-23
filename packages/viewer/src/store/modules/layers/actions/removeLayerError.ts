import type { Layer } from '@swissgeo/layers'
import type { ErrorMessage } from '@swissgeo/log/Message'

import { removeErrorMessageFromLayer } from '@swissgeo/layers'
import { layerUtils } from '@swissgeo/layers/utils'
import log, { LogPreDefinedColor } from '@swissgeo/log'

import type { LayerActionFilter, LayersStore } from '@/store/modules/layers/types/layers'
import type { ActionDispatcher } from '@/store/types'

export default function removeLayerError(
    this: LayersStore,
    layer: Layer | string,
    options: LayerActionFilter,
    error: ErrorMessage,
    dispatcher: ActionDispatcher
): void
export default function removeLayerError(
    this: LayersStore,
    layer: Layer | string,
    error: ErrorMessage,
    dispatcher: ActionDispatcher
): void

/**
 * Remove a layer error translation key.
 *
 * NOTE: This set the error key to all layers matching the ID, isExternal, and baseUrl properties.
 */
export default function removeLayerError(
    this: LayersStore,
    layerOrLayerId: Layer | string,
    optionsOrError: LayerActionFilter | ErrorMessage,
    errorOrDispatcher: ErrorMessage | ActionDispatcher,
    dispatcherOrNothing?: ActionDispatcher
) {
    const options = dispatcherOrNothing ? (optionsOrError as LayerActionFilter) : {}
    const error = dispatcherOrNothing
        ? (errorOrDispatcher as ErrorMessage)
        : (optionsOrError as ErrorMessage)
    const dispatcher = dispatcherOrNothing
        ? dispatcherOrNothing
        : (errorOrDispatcher as ActionDispatcher)

    let layerId: string
    if (typeof layerOrLayerId === 'string') {
        layerId = layerOrLayerId
    } else {
        layerId = layerOrLayerId.id
    }

    const layers: Layer[] = this.getLayersById(layerId, options)
    if (layers.length === 0) {
        log.error({
            title: 'Layers store / removeLayerError',
            titleColor: LogPreDefinedColor.Red,
            messages: [
                'Failed to remove layer error: invalid layerId (no matching layer found)',
                layerId,
                options,
            ],
        })
        return
    }
    const updatedLayers = layers.map((layer) => {
        const clone = layerUtils.cloneLayer(layer)
        removeErrorMessageFromLayer(clone, error)
        return clone
    })
    this.updateLayers(updatedLayers, dispatcher)
}
