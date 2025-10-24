import type { CloudOptimizedGeoTIFFLayer, GeoAdminGeoJSONLayer, Layer } from '@swissgeo/layers'

import { LayerType } from '@swissgeo/layers'
import { layerUtils } from '@swissgeo/layers/utils'
import log, { LogPreDefinedColor } from '@swissgeo/log'

import type { LayersStore } from '@/store/modules/layers/types/layers'
import type { ActionDispatcher } from '@/store/types'

import loadCOGMetadataAndUpdateLayer from '@/store/modules/layers/utils/loadCOGMetadataAndUpdateLayer'
import loadGeoJsonDataAndStyle from '@/store/modules/layers/utils/loadGeoJSONDataAndStyle'

/**
 * Sets the list of active layers. This replaces the existing list.
 *
 * NOTE: the layer array is automatically deep cloned
 */
export default function setLayers(
    this: LayersStore,
    layers: Layer[],
    dispatcher: ActionDispatcher
) {
    const clones = layers.map((layer) => layerUtils.cloneLayer(layer))
    this.activeLayers = clones
    clones.forEach((layer) => {
        if (layer.type === LayerType.COG) {
            loadCOGMetadataAndUpdateLayer(layer as CloudOptimizedGeoTIFFLayer, dispatcher).catch(
                (error) => {
                    log.error({
                        title: 'Layers store / setLayers',
                        titleColor: LogPreDefinedColor.Green,
                        messages: ['Error while loading metadata for a COG layer', layer, error],
                    })
                }
            )
        } else if (layer.type === LayerType.GEOJSON) {
            const { promise } = loadGeoJsonDataAndStyle(layer as GeoAdminGeoJSONLayer, dispatcher)
            promise.catch((error) => {
                log.error({
                    title: 'Layers store / setLayers',
                    titleColor: LogPreDefinedColor.Green,
                    messages: [
                        'Error while loading data and style for a GeoJSON layer',
                        layer,
                        error,
                    ],
                })
            })
        }
    })
}
