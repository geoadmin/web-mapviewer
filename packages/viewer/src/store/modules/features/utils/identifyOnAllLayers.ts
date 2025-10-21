import type { FlatExtent, NormalizedExtent } from '@swissgeo/coordinates'
import type { Layer } from '@swissgeo/layers'

import { extentUtils } from '@swissgeo/coordinates'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import { containsCoordinate, getIntersection as getExtentIntersection } from 'ol/extent'

import { identify, type IdentifyConfig, type LayerFeature } from '@/api/features.api'
import getFeatureCountForCoordinate from '@/store/modules/features/utils/getFeatureCountForCoordinate'

interface MultipleIdentifyConfig extends Omit<IdentifyConfig, 'layer'> {
    layers: Layer[]
}

/**
 * Identifies feature at the given coordinates
 *
 * @returns A promise that will contain all feature identified by the different requests (won't be
 *   grouped by layer)
 */
export default function identifyOnAllLayers(
    config: MultipleIdentifyConfig
): Promise<LayerFeature[]> {
    const {
        layers,
        coordinate,
        resolution,
        mapExtent,
        screenWidth,
        screenHeight,
        lang,
        projection,
        featureCount = getFeatureCountForCoordinate(coordinate),
    } = config
    return new Promise((resolve, reject) => {
        const allFeatures: LayerFeature[] = []
        const pendingRequests: Promise<LayerFeature[]>[] = []
        const commonParams = {
            coordinate,
            resolution,
            mapExtent,
            screenWidth,
            screenHeight,
            lang,
            projection,
            featureCount,
        }
        // for each layer we run a backend request
        // NOTE: in theory for the Geoadmin layers we could run one single backend request to API3 instead of one per layer, however
        // this would not be more efficient as a single request would take more time that several in parallel (this has been tested).
        layers
            // only request layers that have getFeatureInfo capabilities (or are flagged has having a tooltip in their config for GeoAdmin layers)
            .filter((layer) => layer.hasTooltip)
            // filtering out any layer for which their extent doesn't contain the wanted coordinate (no data anyway, no need to request)
            .filter((layer) => {
                if (
                    !('extent' in layer) ||
                    (Array.isArray(layer.extent) && [2, 4].includes(layer.extent.length))
                ) {
                    return true
                }
                const layerExtent: FlatExtent | NormalizedExtent = layer.extent as
                    | FlatExtent
                    | NormalizedExtent
                if (coordinate.length === 2) {
                    return containsCoordinate(extentUtils.flattenExtent(layerExtent), coordinate)
                }
                return getExtentIntersection(
                    extentUtils.flattenExtent(layerExtent),
                    extentUtils.flattenExtent(coordinate)
                ).every((value) => !isNaN(value))
            })
            .forEach((layer) => {
                pendingRequests.push(
                    identify({
                        layer,
                        ...commonParams,
                    })
                )
            })
        // grouping all features from the different requests
        Promise.allSettled(pendingRequests)
            .then((responses) => {
                responses.forEach((response) => {
                    if (response.status === 'fulfilled' && response.value) {
                        allFeatures.push(...response.value)
                    } else {
                        log.error(
                            'Error while identifying features on external layer, response is',
                            response
                        )
                        // no reject, so that we may see at least the result of requests that have been fulfilled
                    }
                })
                // filtering out duplicates
                resolve(
                    Array.from(
                        new Map(allFeatures.map((feature) => [feature.id, feature])).values()
                    )
                )
            })
            .catch((error) => {
                log.error({
                    title: 'Feature store / identify',
                    titleStyle: {
                        backgroundColor: LogPreDefinedColor.Purple,
                    },
                    messages: ['Error while identifying features', error],
                })
                reject(new Error(error))
            })
    })
}
