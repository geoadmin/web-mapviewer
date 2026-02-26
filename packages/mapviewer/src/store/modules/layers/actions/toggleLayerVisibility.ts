import log, { LogPreDefinedColor } from '@swissgeo/log'

import type {
    GetLayerIdOptions,
    GetLayerIdResult,
} from '@/store/modules/layers/actions/identifyFeatures'
import type { LayersStore } from '@/store/modules/layers/types'
import type { ActionDispatcher } from '@/store/types'

import useFeaturesStore from '@/store/modules/features'

/** Toggle the layer visibility of the layer corresponding to this index, in the active layer list */
export default function toggleLayerVisibility(
    this: LayersStore,
    index: number,
    dispatcher: ActionDispatcher
) {
    const layer = this.getActiveLayerByIndex(index)
    if (!layer) {
        log.error({
            title: 'Layers store / toggleLayerVisibility',
            titleColor: LogPreDefinedColor.Red,
            messages: ['Failed to toggleLayerVisibility: invalid index', index, dispatcher],
        })
        return
    }

    // Register the hook before changing visibility to avoid race conditions
    // After the layer visibility has been toggled we need to identify features again
    // We wait for the next router navigation to complete to ensure the storeSync plugin has updated the URL
    // with the new layer visibility before identifying features, otherwise the URL will be out of sync
    // and the layers may reappear on the page
    if (this.router) {
        const removeHook = this.router.afterEach(() => {
            removeHook()
            this.identifyFeatures(
                setLayerIdUpdateFeatures,
                { activeLayer: layer, index },
                dispatcher
            )
        })
    } else {
        this.identifyFeatures(setLayerIdUpdateFeatures, { activeLayer: layer, index }, dispatcher)
    }

    layer.isVisible = !layer.isVisible
}

function setLayerIdUpdateFeatures(options: GetLayerIdOptions): GetLayerIdResult {
    const featuresStore = useFeaturesStore()

    const selectedFeatures = featuresStore.selectedFeatures
    let layerId: string | undefined
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
