import type { Layer } from '@swissgeo/layers'

import { layerUtils } from '@swissgeo/layers/utils'
import log, { LogPreDefinedColor } from '@swissgeo/log'

import type { LayersStore } from '@/store/modules/layers/types/layers'
import type { ActionDispatcher } from '@/store/types'

import afterAddOperations from '@/store/modules/layers/utils/afterAddOperations'
import usePositionStore from '@/store/modules/position'

interface AddLayerOptions {
    zoomToLayerExtent?: boolean
    initialValues?: Partial<Layer>
}

/**
 * Add a layer on top of the active layers.
 *
 * It will do so by cloning the layer that is given. This is done so that we may add one "layer"
 * multiple time to the active layers list (for instance having a time enabled layer added multiple
 * time with a different timestamp)
 */
export default function addLayer(
    this: LayersStore,
    layer: Layer,
    dispatcher: ActionDispatcher
): void
/**
 * Add a layer on top of the active layers.
 *
 * It will do so by cloning the layer that is given. This is done so that we may add one "layer"
 * multiple time to the active layers list (for instance having a time enabled layer added multiple
 * time with a different timestamp)
 */
export default function addLayer(
    this: LayersStore,
    layer: Layer,
    options: AddLayerOptions,
    dispatcher: ActionDispatcher
): void

/**
 * Add a layer on top of the active layers.
 *
 * It will do so by cloning the layer that matches the layer ID in the layers' config. This is done
 * so that we may add one "layer" multiple time to the active layers list (for instance having a
 * time enabled layer added multiple time with a different timestamp)
 */
export default function addLayer(
    this: LayersStore,
    layerId: string,
    dispatcher: ActionDispatcher
): void
/**
 * Add a layer on top of the active layers.
 *
 * It will do so by cloning the layer that matches the layer ID in the layers' config. This is done
 * so that we may add one "layer" multiple time to the active layers list (for instance having a
 * time enabled layer added multiple time with a different timestamp)
 */
export default function addLayer(
    this: LayersStore,
    layerId: string,
    options: AddLayerOptions,
    dispatcher: ActionDispatcher
): void

/**
 * Add a layer on top of the active layers.
 *
 * It will do so by cloning the layer that is given, or the one that matches the layer ID in the
 * layers' config. This is done so that we may add one "layer" multiple time to the active layers
 * list (for instance having a time enabled layer added multiple time with a different timestamp)
 */
export default function addLayer(
    this: LayersStore,
    input: Layer | string,
    optionsOrDispatcher: AddLayerOptions | ActionDispatcher,
    dispatcherOrNothing?: ActionDispatcher
): void {
    const options = dispatcherOrNothing ? (optionsOrDispatcher as AddLayerOptions) : {}
    const dispatcher = dispatcherOrNothing ?? (optionsOrDispatcher as ActionDispatcher)

    const { zoomToLayerExtent, initialValues } = options

    let layer: Layer | undefined
    if (typeof input === 'string') {
        layer = this.getLayerConfigById(input)
    } else {
        layer = input
    }
    if (!layer) {
        log.error({
            title: 'Layers store / addLayer',
            titleColor: LogPreDefinedColor.Red,
            messages: ['no layer found for input:', input],
        })
        return
    }

    // Creating a clone of the config, so that we do not modify the initial config of the app.
    // It is possible to add one layer many times, so we want to always have the correct
    // default values when we add it, not the settings from the layer already added.
    const clone = layerUtils.cloneLayer(layer)
    if (initialValues) {
        Object.assign(clone, initialValues)
    }

    if (clone) {
        this.activeLayers.push(clone)
        if (
            zoomToLayerExtent &&
            'extent' in layer &&
            Array.isArray(layer.extent) &&
            layer.extent.length === 4
        ) {
            const layerExtent = layer.extent
            usePositionStore().zoomToExtent(layerExtent, dispatcher)
        }
        afterAddOperations(clone, dispatcher)
    } else {
        log.error({
            title: 'Layers store / addLayer',
            titleColor: LogPreDefinedColor.Red,
            messages: ['no layer found for payload:', layer, options, dispatcher],
        })
    }
    this.identifyFeatures(dispatcher)
}
