import type { Layer } from '@swissgeo/layers'

import { layerUtils } from '@swissgeo/layers/utils'
import log, { LogPreDefinedColor } from '@swissgeo/log'

import type { LayersStore } from '@/store/modules/layers/types/layers'
import type { ActionDispatcher } from '@/store/types'

/**
 * Full or partial update of layers in the active layer list. The update is done by IDs and updates
 * all layer matching the IDs
 *
 * @param layers List of full layer object (Layer) to update or an object with the layer ID to
 *   update and any property to update (partial update)
 * @param dispatcher
 */
export default function updateLayers(
    this: LayersStore,
    // we want at least `Layer`, it can contain more
    layers: Partial<Layer>[],
    dispatcher: ActionDispatcher
) {
    layers
        .map((layer) => {
            if (typeof layer === 'object' && 'id' in layer && layer.id !== undefined) {
                const layers2Update: Layer[] = this.getActiveLayersById(layer.id, {
                    isExternal: layer.isExternal,
                    baseUrl: layer.baseUrl,
                })
                if (!layers2Update) {
                    throw new Error(
                        `Failed to updateLayers: "${layer.id}" not found in active layers`
                    )
                }
                return layers2Update.map((layer2Update) => {
                    const updatedLayer = layerUtils.cloneLayer(layer2Update)
                    Object.assign(updatedLayer, layer)
                    return updatedLayer
                })
            } else {
                log.error({
                    title: 'Layers store / updateLayers',
                    titleColor: LogPreDefinedColor.Red,
                    messages: [
                        'Failed to updateLayers: insufficient data to update layer (missing id, or wrong type of layer received)',
                        layer,
                        dispatcher,
                    ],
                })
            }
        })
        .flat()
        .filter((layer) => layer !== undefined)
        .forEach((layer) => {
            this.getActiveLayersById(layer.id, {
                isExternal: layer.isExternal,
                baseUrl: layer.baseUrl,
            }).forEach((layer2Update: Layer) => {
                Object.assign(layer2Update, layer)
            })
        })
}
