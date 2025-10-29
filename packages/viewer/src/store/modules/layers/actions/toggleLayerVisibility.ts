import log, { LogPreDefinedColor } from '@swissgeo/log'

import type { GetLayerIdOptions, GetLayerIdResult } from '@/store/modules/layers/actions/identifyFeatures'
import type { LayersStore } from '@/store/modules/layers/types/layers'
import type { ActionDispatcher } from '@/store/types'

import useFeaturesStore from '@/store/modules/features'

/**
 * Toggle the layer visibility of the layer corresponding to this index, in the active layer
 * list
 */
export default function toggleLayerVisibility(
    this: LayersStore,
    index: number,
    dispatcher: ActionDispatcher
) {
    const layer = this.getActiveLayerByIndex(index)
    if (layer) {
        layer.isVisible = !layer.isVisible
    } else {
        log.error({
            title: 'Layers store / toggleLayerVisibility',
            titleColor: LogPreDefinedColor.Red,
            messages: ['Failed to toggleLayerVisibility: invalid index', index, dispatcher],
        })
    }
    this.identifyFeatures(setLayerIdUpdateFeatures, { activeLayer: layer, index }, dispatcher)
}

function setLayerIdUpdateFeatures(options: GetLayerIdOptions): GetLayerIdResult {
    const featuresStore = useFeaturesStore()

    const selectedFeatures = featuresStore.selectedFeatures
    let layerId
    // for toggleLayerVisibility we always update if layer has gone from invisible to visible
    // if the layer went from visible to invisible we need to check if there are selected features from this layer
    let updateFeatures = true
    if (!options.activeLayer?.isVisible) {
        layerId = options.activeLayer?.id
    }

    if (layerId) {
        updateFeatures = selectedFeatures.some(
            (feature) => 'layer' in feature && feature.layer.id === layerId
        )
    }

    return { layerId, updateFeatures }
}
