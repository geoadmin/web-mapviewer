import type { Layer } from '@swissgeo/layers'

import type { LayersStore } from '@/store/modules/layers/types/layers'
import type { ActionDispatcher } from '@/store/types'

import useFeaturesStore from '@/store/modules/features'
import { isNoFeatureSelected } from '@/store/modules/layers/utils/selectedFeatures'
import useMapStore from '@/store/modules/map'

export interface GetLayerIdOptions {
    layerOrIndex?: number | string | Layer
    index?: number
    this: LayersStore
}
export interface GetLayerIdResult {
    layerId?: string
    updateFeatures?: boolean
}

export function identifyFeatures(this: LayersStore, getLayerContext: ((options: GetLayerIdOptions) => GetLayerIdResult) | undefined, options: GetLayerIdOptions, dispatcher: ActionDispatcher) {
    const featuresStore = useFeaturesStore()
    const mapStore = useMapStore()
    const selectedFeatures = featuresStore.selectedFeatures
    let clickInfo = mapStore.clickInfo

    if (isNoFeatureSelected(clickInfo, selectedFeatures)) {
        return
    }
    clickInfo = clickInfo!
    // for 'setLayerYear', 'addLayer', 'clearLayers', 'removeLayerByIndex' we always update
    const { layerId, updateFeatures: shouldUpdateFeatures = true } = getLayerContext?.(options) ?? {}
    let updateFeatures = shouldUpdateFeatures

    if (layerId) {
        updateFeatures = selectedFeatures.some(
            (feature) => 'layer' in feature && feature.layer.id === layerId
        )
    }

    if (updateFeatures && clickInfo.features) {
        featuresStore.identifyFeatureAt(
            this.visibleLayers.filter((layer: Layer) => layer.hasTooltip),
            clickInfo.coordinate,
            clickInfo.features,
            dispatcher
        )
    }
}
