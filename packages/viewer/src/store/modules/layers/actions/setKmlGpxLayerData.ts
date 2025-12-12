import type { FlatExtent } from '@swissgeo/coordinates'
import type { GPXLayer, GPXMetadata, KMLLayer, KMLMetadata, Layer } from '@swissgeo/layers'

import { extentUtils, WGS84 } from '@swissgeo/coordinates'
import { addErrorMessageToLayer, LayerType, removeErrorMessageFromLayer } from '@swissgeo/layers'
import { layerUtils } from '@swissgeo/layers/utils'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import { ErrorMessage } from '@swissgeo/log/Message'

import type { LayersStore } from '@/store/modules/layers/types'
import type { ActionDispatcher } from '@/store/types'

import usePositionStore from '@/store/modules/position'
import { getGpxExtent } from '@/utils/gpxUtils'
import { getKmlExtent, parseKmlName } from '@/utils/kmlUtils'

/**
 * Set KML/GPX layer(s) with its data and metadata.
 *
 * NOTE: all matching layers will be set.
 */
export default function setKmlGpxLayerData(
    this: LayersStore,
    layerId: string,
    data: string,
    metadata: KMLMetadata | GPXMetadata,
    dispatcher: ActionDispatcher
) {
    const layers: Layer[] = this.getActiveLayersById(layerId)
    if (!layers || layers.some((layer) => [LayerType.KML, LayerType.GPX].includes(layer.type))) {
        log.error({
            title: 'Layers store / setKmlGpxLayerData',
            titleColor: LogPreDefinedColor.Red,
            messages: [
                'Failed to setKmlGpxLayerData: invalid layerId (no matching KML/GPX layer found)',
                layerId,
            ],
        })
        return
    }
    const updatedLayers = layers.map((layer) => {
        const clone = layerUtils.cloneLayer(layer)
        let extent: FlatExtent | undefined

        if (clone.type === LayerType.KML) {
            const kmlLayer = clone as KMLLayer
            let kmlName: string | undefined = parseKmlName(data)
            if (!kmlName || kmlName === '') {
                kmlName = kmlLayer.kmlFileUrl
            }
            if (kmlName) {
                kmlLayer.name = kmlName
            }
            kmlLayer.kmlData = data
            kmlLayer.kmlMetadata = metadata as KMLMetadata
            extent = getKmlExtent(data)
        } else if (clone.type === LayerType.GPX) {
            const gpxLayer = clone as GPXLayer
            const gpxMetadata = metadata as GPXMetadata
            // The name of the GPX is derived from the metadata below
            gpxLayer.gpxData = data
            gpxLayer.gpxMetadata = gpxMetadata
            gpxLayer.name = gpxMetadata.name ?? 'GPX'
            extent = getGpxExtent(data)
        }
        clone.isLoading = false

        // Always clean up the error messages before doing the check
        const emptyFileErrorMessage = new ErrorMessage('kml_gpx_file_empty')
        const outOfBoundsErrorMessage = new ErrorMessage('imported_file_out_of_bounds')
        removeErrorMessageFromLayer(clone, emptyFileErrorMessage)
        removeErrorMessageFromLayer(clone, outOfBoundsErrorMessage)

        if (!extent) {
            addErrorMessageToLayer(clone, emptyFileErrorMessage)
        } else if (
            !extentUtils.getExtentIntersectionWithCurrentProjection(
                extent,
                WGS84,
                usePositionStore().projection
            )
        ) {
            addErrorMessageToLayer(clone, outOfBoundsErrorMessage)
        }
        return clone
    })
    this.updateLayers(updatedLayers, dispatcher)
}
