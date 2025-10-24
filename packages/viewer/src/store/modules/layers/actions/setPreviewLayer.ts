import type { GeoAdminGeoJSONLayer, Layer } from '@swissgeo/layers'

import { LayerType } from '@swissgeo/layers'
import { layerUtils } from '@swissgeo/layers/utils'
import log, { LogPreDefinedColor } from '@swissgeo/log'

import type { LayersStore } from '@/store/modules/layers/types/layers'
import type { ActionDispatcher } from '@/store/types'

import loadGeoJsonDataAndStyle from '@/store/modules/layers/utils/loadGeoJSONDataAndStyle'

let previewLayerAbortController: AbortController | undefined

export default function setPreviewLayer(
    this: LayersStore,
    layer: Layer | string | undefined,
    dispatcher: ActionDispatcher
) {
    if (previewLayerAbortController) {
        previewLayerAbortController.abort(
            'Preview layer changed/cleared, no need to load this data anymore'
        )
        previewLayerAbortController = undefined
    }

    if (layer === undefined) {
        this.previewLayer = undefined
        return
    }

    let clone
    if (typeof layer === 'object') {
        // got the layer, thus we copy it directly
        clone = layerUtils.cloneLayer(layer)
    } else {
        // got an ID, look for the layer
        const matchingLayer = this.getLayerConfigById(layer)
        if (matchingLayer) {
            clone = layerUtils.cloneLayer(matchingLayer)
        }
    }
    if (!clone) {
        log.error({
            title: 'Layers store / setPreviewLayer',
            titleColor: LogPreDefinedColor.Red,
            messages: [
                'Failed to setPreviewLayer: invalid layer identifier or layer object',
                layer,
                dispatcher,
            ],
        })
        return
    }
    clone.isVisible = true
    this.previewLayer = clone

    if (clone.type === LayerType.GEOJSON) {
        const { promise, abortController } = loadGeoJsonDataAndStyle(
            clone as GeoAdminGeoJSONLayer,
            dispatcher
        )
        previewLayerAbortController = abortController
        promise.catch((error) => {
            log.error({
                title: 'Layers store / setPreviewLayer',
                titleColor: LogPreDefinedColor.Green,
                messages: ['Error while loading data and style for a GeoJSON layer', clone, error],
            })
            previewLayerAbortController = undefined
        })
    }
}
