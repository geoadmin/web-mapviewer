import type { CloudOptimizedGeoTIFFLayer, GeoAdminGeoJSONLayer, GPXLayer, KMLLayer, Layer, } from '@swissgeo/layers'

import log, { LogPreDefinedColor } from '@swissgeo/log'

import type { ActionDispatcher } from '@/store/types'

import loadCOGMetadataAndUpdateLayer from '@/store/modules/layers/utils/loadCOGMetadataAndUpdateLayer'
import loadGeoJsonDataAndStyle from '@/store/modules/layers/utils/loadGeoJSONDataAndStyle'
import loadGpxData from '@/store/modules/layers/utils/loadGpxData'
import loadKmlKmzData from '@/store/modules/layers/utils/loadKmlKmzData'
import loadLayerFromCapabilities, {
    isAnExternalLayerRequiringCapabilitesLoading,
} from '@/store/modules/layers/utils/loadLayerFromCapabilities'

/**
 * Perform some operations after a layer has been added to the store/map depending on its type (and
 * its state)
 */
export default function afterAddOperations(layer: Layer, dispatcher: ActionDispatcher) {
    if (layer.type === 'COG') {
        loadCOGMetadataAndUpdateLayer(layer as CloudOptimizedGeoTIFFLayer, dispatcher).catch(
            (error) => {
                log.error({
                    title: 'Layers store / afterAddOperations',
                    titleColor: LogPreDefinedColor.Green,
                    messages: ['Error while loading metadata for a COG layer', layer, error],
                })
            }
        )
    } else if (layer.type === 'GEOJSON') {
        const { promise } = loadGeoJsonDataAndStyle(layer as GeoAdminGeoJSONLayer, dispatcher)
        promise.catch((error) => {
            log.error({
                title: 'Layers store / afterAddOperations',
                titleColor: LogPreDefinedColor.Green,
                messages: ['Error while loading data and style for a GeoJSON layer', layer, error],
            })
        })
    } else if (layer.type === 'GPX') {
        loadGpxData(layer as GPXLayer, dispatcher).catch((error) => {
            log.error({
                title: 'Layers store / afterAddOperations',
                titleColor: LogPreDefinedColor.Green,
                messages: ['Error while loading data for a GPX layer', layer, error],
            })
        })
    } else if (layer.type === 'KML') {
        loadKmlKmzData(layer as KMLLayer, dispatcher).catch((error) => {
            log.error({
                title: 'Layers store / afterAddOperations',
                titleColor: LogPreDefinedColor.Green,
                messages: ['Error while loading data for a KML/KMZ layer', layer, error],
            })
        })
    } else if (isAnExternalLayerRequiringCapabilitesLoading(layer)) {
        loadLayerFromCapabilities(layer, dispatcher).catch((error) => {
            log.error({
                title: 'Layers store / afterAddOperations',
                titleColor: LogPreDefinedColor.Green,
                messages: ['Error while loading capabilities for a WMS/WMTS layer', layer, error],
            })
        })
    }
}
