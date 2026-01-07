import type { Layer } from '@swissgeo/layers'

import log from '@swissgeo/log'

import type { LayersStore } from '@/store/modules/layers/types'
import type { ActionDispatcher } from '@/store/types'

import useFeaturesStore from '@/store/modules/features'
import useMapStore from '@/store/modules/map'

export type GetLayerContextFunction = (options: GetLayerIdOptions) => GetLayerIdResult
export interface GetLayerIdOptions {
    layerOrIndex?: number | string | Layer
    index?: number
    activeLayer?: Layer
}
export interface GetLayerIdResult {
    layerId?: string
    updateFeatures?: boolean
}

export function identifyFeatures(this: LayersStore, dispatcher: ActionDispatcher): void
export function identifyFeatures(
    this: LayersStore,
    getLayerContext: GetLayerContextFunction,
    options: GetLayerIdOptions,
    dispatcher: ActionDispatcher
): void
export function identifyFeatures(
    this: LayersStore,
    functionOrDispatcher: GetLayerContextFunction | ActionDispatcher,
    optionsOrDispatcher?: GetLayerIdOptions | ActionDispatcher,
    dispatcherOrNothing?: ActionDispatcher
): void {
    // Determine which overload was called
    let getLayerContext: GetLayerContextFunction | undefined
    let options: GetLayerIdOptions = {}
    let dispatcher: ActionDispatcher

    if (typeof functionOrDispatcher === 'function' && optionsOrDispatcher && dispatcherOrNothing) {
        // Second overload: getLayerContext, options, dispatcher
        getLayerContext = functionOrDispatcher as GetLayerContextFunction
        options = optionsOrDispatcher as GetLayerIdOptions
        dispatcher = dispatcherOrNothing
    } else {
        // First overload: dispatcher only
        getLayerContext = undefined
        options = {}
        dispatcher = functionOrDispatcher as ActionDispatcher
    }

    const featuresStore = useFeaturesStore()
    const mapStore = useMapStore()
    const selectedFeatures = featuresStore.selectedFeatures
    const clickInfo = mapStore.clickInfo
    console.log('identifyFeatures called with options:', options, clickInfo, this.isFeatureSelected(clickInfo))
    if (!clickInfo || !clickInfo.features || !this.isFeatureSelected(clickInfo)) {
        // featuresStore.clearAllSelectedFeatures(dispatcher)
        return
    }

    // for 'setLayerYear', 'addLayer', 'clearLayers', 'removeLayerByIndex' we always update
    const { layerId, updateFeatures: shouldUpdateFeatures = true } =
        getLayerContext?.(options) ?? {}
    let updateFeatures = shouldUpdateFeatures
    console.log('Identify features called with layerId:', layerId, 'updateFeatures:', updateFeatures)
    if (layerId) {
        updateFeatures = selectedFeatures.some(
            (feature) => 'layer' in feature && feature.layer.id === layerId
        )
    }

    if (updateFeatures) {
        featuresStore
            .identifyFeatureAt(
                this.visibleLayers.filter((layer: Layer) => layer.hasTooltip),
                clickInfo.coordinate,
                clickInfo.features,
                dispatcher
            )
            .catch((error) => {
                log.error({
                    title: 'Layers store / identifyFeatures',
                    messages: ['Error during feature identification', error],
                })
            })
    }
}
