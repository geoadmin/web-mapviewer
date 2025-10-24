import type { GeoAdminGeoJSONLayer, Layer } from '@swissgeo/layers'

import { LayerType } from '@swissgeo/layers'

import type { LayerActionFilter, LayersStore } from '@/store/modules/layers/types/layers'
import type { ActionDispatcher } from '@/store/types'

import { clearAutoReload } from '@/store/modules/layers/utils/autoReloadGeoJson'
import matchTwoLayers from '@/store/modules/layers/utils/matchTwoLayers'

export default function removeLayer(
    this: LayersStore,
    layer: number | string | Layer,
    dispatcher: ActionDispatcher
): void
export default function removeLayer(
    this: LayersStore,
    layer: string | Layer,
    options: LayerActionFilter,
    dispatcher: ActionDispatcher
): void

export default function removeLayer(
    this: LayersStore,
    input: number | string | Layer,
    optionsOrDispatcher: LayerActionFilter | ActionDispatcher,
    dispatcherOrNothing?: ActionDispatcher
) {
    const options = dispatcherOrNothing ? (optionsOrDispatcher as LayerActionFilter) : {}
    const { baseUrl, isExternal } = options

    const removedLayers: Layer[] = []

    if (typeof input === 'number') {
        removedLayers.push(...this.activeLayers.splice(input, 1))
    } else {
        let layerId: string | undefined
        if (typeof input === 'string') {
            layerId = input
        } else {
            layerId = input.id
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
}
