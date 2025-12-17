import type { GeoAdminGeoJSONLayer, Layer } from '@swissgeo/layers'

import { LayerType } from '@swissgeo/layers'

import type {
    GetLayerIdOptions,
    GetLayerIdResult,
} from '@/store/modules/layers/actions/identifyFeatures'
import type { LayerActionFilter, LayersStore } from '@/store/modules/layers/types'
import type { ActionDispatcher } from '@/store/types'

import useFeaturesStore from '@/store/modules/features'
import { clearAutoReload } from '@/store/modules/layers/utils/autoReloadGeoJson'
import matchTwoLayers from '@/store/modules/layers/utils/matchTwoLayers'

export default function removeLayer(
    this: LayersStore,
    layer: number | string | Layer,
    dispatcher: ActionDispatcher
): void
export default function removeLayer(
    this: LayersStore,
    // no index (number) type here, as it is not possible to remove a layer by index whilst giving a filtering option
    layer: string | Layer,
    options: LayerActionFilter,
    dispatcher: ActionDispatcher
): void

export default function removeLayer(
    this: LayersStore,
    layerOrIndex: number | string | Layer,
    optionsOrDispatcher: LayerActionFilter | ActionDispatcher,
    dispatcherOrNothing?: ActionDispatcher
) {
    const options = dispatcherOrNothing ? (optionsOrDispatcher as LayerActionFilter) : {}
    const dispatcher = dispatcherOrNothing ?? (optionsOrDispatcher as ActionDispatcher)
    const { baseUrl, isExternal } = options

    const removedLayers: Layer[] = []

    if (typeof layerOrIndex === 'number') {
        removedLayers.push(...this.activeLayers.splice(layerOrIndex, 1))
    } else {
        let layerId: string | undefined
        if (typeof layerOrIndex === 'string') {
            layerId = layerOrIndex
        } else {
            layerId = layerOrIndex.id
        }

        removedLayers.push(
            ...this.activeLayers.filter((layer) =>
                matchTwoLayers(layerId, isExternal, baseUrl, layer)
            )
        )
        this.activeLayers = this.activeLayers.filter(
            (layer) => !matchTwoLayers(layerId, isExternal, baseUrl, layer)
        )
    }
    removedLayers.forEach((layer) => {
        if (layer.type === LayerType.GEOJSON) {
            const geoJsonLayer = layer as GeoAdminGeoJSONLayer
            if (geoJsonLayer.updateDelay && geoJsonLayer.updateDelay > 0) {
                clearAutoReload(geoJsonLayer)
            }
        }
    })
    let layerByIndex: Layer | undefined
    if (typeof layerOrIndex === 'number') {
        layerByIndex = this.getActiveLayerByIndex(layerOrIndex)
    }
    this.identifyFeatures(
        setLayerIdUpdateFeatures,
        { activeLayer: layerByIndex, layerOrIndex },
        dispatcher
    )
}

function setLayerIdUpdateFeatures(options: GetLayerIdOptions): GetLayerIdResult {
    const featuresStore = useFeaturesStore()

    const selectedFeatures = featuresStore.selectedFeatures
    let layerId
    let updateFeatures = true
    if (typeof options.layerOrIndex === 'string') {
        layerId = options.layerOrIndex
    } else if (typeof options.layerOrIndex === 'number') {
        if (options.activeLayer) {
            layerId = options.activeLayer.id
        }
    }

    if (layerId) {
        updateFeatures = selectedFeatures.some(
            (feature) => 'layer' in feature && feature.layer.id === layerId
        )
    }

    return { layerId, updateFeatures }
}
