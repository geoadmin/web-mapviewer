import log from '@geoadmin/log'
import axios from 'axios'

import {
    BASE_URL_DEV,
    BASE_URL_INT,
    BASE_URL_PROD,
    DEFAULT_GEOADMIN_MAX_WMTS_RESOLUTION,
    type Staging,
    WMTS_BASE_URL_DEV,
    WMTS_BASE_URL_INT,
    WMTS_BASE_URL_PROD,
} from '@/config'
import {
    type AggregateSubLayer,
    type GeoAdminLayer,
    type LayerAttribution,
    LayerType,
} from '@/index'
import { layerUtils, timeConfigUtils } from '@/utils'

function getWmtsBaseUrlForStaging(staging: Staging = 'production'): string {
    switch (staging) {
        case 'development':
            return WMTS_BASE_URL_DEV
        case 'integration':
            return WMTS_BASE_URL_INT
        default:
            return WMTS_BASE_URL_PROD
    }
}

function getApi3BaseUrlForStaging(staging: Staging = 'production'): string {
    switch (staging) {
        case 'development':
            return BASE_URL_DEV
        case 'integration':
            return BASE_URL_INT
        default:
            return BASE_URL_PROD
    }
}

const _urlWithTrailingSlash = (baseUrl: string): string => {
    if (baseUrl && !baseUrl.endsWith('/')) {
        return baseUrl + '/'
    }
    return baseUrl
}

// API file that covers the backend endpoint http://api3.geo.admin.ch/rest/services/all/MapServer/layersConfig

/**
 * Transform the backend metadata JSON object into instances of {@link GeoAdminLayer}, instantiating
 * the correct type of layer for each entry ({@link GeoAdminAggregateLayer},
 * {@link GeoAdminWMTSLayer}, {@link GeoAdminWMSLayer} or {@link GeoAdminGeoJsonLayer})
 */
function generateClassForLayerConfig(
    layerConfig: Record<string, any>,
    id: string,
    allOtherLayers: Record<string, any>,
    lang: string,
    staging: Staging = 'production'
): GeoAdminLayer | undefined {
    if (!layerConfig) {
        return
    }
    const {
        serverLayerName,
        label: name,
        type,
        opacity,
        format,
        background: isBackground,
        highlightable: isHighlightable,
        tooltip: hasTooltip,
        attribution: attributionName,
        attributionUrl: potentialAttributionUrl,
        hasLegend,
        searchable,
    } = layerConfig
    // checking if attributionUrl is a well-formed URL, otherwise we drop it
    let attributionUrl = null
    try {
        new URL(potentialAttributionUrl)
        // if we are here, no error has been raised by the URL construction
        // meaning we have a valid URL in potentialAttributionUrl
        attributionUrl = potentialAttributionUrl
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
        // this is not a well-formed URL, we do nothing with it
    }
    let timestamps: any[] = []
    if (Array.isArray(layerConfig.timestamps) && layerConfig.timestamps.length > 0) {
        timestamps = layerConfig.timestamps.map((timestamp) =>
            timeConfigUtils.makeTimeConfigEntry(timestamp)
        )
    }
    const timeConfig = timeConfigUtils.makeTimeConfig(layerConfig.timeBehaviour, timestamps)
    const topics = layerConfig.topics ? layerConfig.topics.split(',') : []
    const attributions: LayerAttribution[] = []
    if (attributionName) {
        attributions.push({ name: attributionName, url: attributionUrl })
    }
    switch (type.toLowerCase()) {
        case 'vector':
            log.info('Vector layer format is TBD in our backends')
            break
        case 'wmts': {
            return layerUtils.makeGeoAdminWMTSLayer({
                type: LayerType.WMTS,
                name,
                id,
                baseUrl: _urlWithTrailingSlash(getWmtsBaseUrlForStaging(staging)),
                idIn3d: layerConfig.config3d ?? null,
                technicalName: serverLayerName,
                opacity,
                attributions,
                format,
                timeConfig: timeConfig ?? undefined,
                isBackground: !!isBackground,
                isHighlightable,
                hasTooltip,
                topics,
                hasLegend: !!hasLegend,
                searchable: !!searchable,
                maxResolution:
                    layerConfig.resolutions?.slice(-1)[0] ?? DEFAULT_GEOADMIN_MAX_WMTS_RESOLUTION,
                hasDescription: true,
            })
        }
        case 'wms': {
            return layerUtils.makeGeoAdminWMSLayer({
                type: LayerType.WMS,
                name,
                id: id,
                idIn3d: layerConfig.config3d ?? null,
                technicalName: Array.isArray(layerConfig.wmsLayers)
                    ? layerConfig.wmsLayers.join(',')
                    : (layerConfig.wmsLayers ?? serverLayerName),
                opacity,
                attributions,
                baseUrl: layerConfig.wmsUrl,
                format,
                timeConfig: timeConfig ?? undefined,
                wmsVersion: '1.3.0',
                lang,
                gutter: layerConfig.gutter,
                isHighlightable,
                hasTooltip,
                topics,
                hasLegend: !!hasLegend,
                searchable: !!searchable,
            })
        }
        case 'geojson': {
            return layerUtils.makeGeoAdminGeoJSONLayer({
                type: LayerType.GEOJSON,
                name,
                id,
                opacity,
                isVisible: false,
                attributions,
                geoJsonUrl: layerConfig.geojsonUrl,
                styleUrl: layerConfig.styleUrl,
                updateDelay: layerConfig.updateDelay,
                hasLegend: !!hasLegend,
                hasTooltip: false,
                technicalName: id,
                hasDescription: true,
                isExternal: false,
                isLoading: true,
                hasError: false,
                hasWarning: false,
            })
        }
        case 'aggregate': {
            // here it's a bit tricky, the aggregate layer has a main entry in the layers config (with everything as usual)
            // but things get complicated with sub-layers. Each sub-layer has an entry in the config but it's ID (or
            // key in the config) is not the one we should ask the server with, that would be the serverLayerName prop,
            // but the parent layer will describe it's child layers with another identifier, which is the key to the
            // raw config in the big backend config object.
            // here's an example:
            // {
            //   "parent.layer": {
            //      "serverLayerName": "i.am.a.big.aggregate.layer",
            //      "subLayersIds": [
            //          "i.am.a.sub.layer_1", <-- that will be the key to another object
            //          "i.am.a.sub.layer_2",
            //      ]
            //   },
            //   "i.am.a.sub.layer_1": { <-- that's one of the "subLayersIds"
            //       "serverLayerName": "hey.i.am.not.the.same.as.the.sublayer.id", <-- that's the ID that should be used to ask the server for tiles
            //   },
            // }

            // here id would be "parent.layer" in the example above
            const subLayers: AggregateSubLayer[] = []
            layerConfig.subLayersIds.forEach((subLayerId: string) => {
                // each subLayerId is one of the "subLayersIds", so "i.am.a.sub.layer_1" or "i.am.a.sub.layer_2" from the example above
                const subLayerRawConfig = allOtherLayers[subLayerId]
                // the "real" layer ID (the one that will be used to request the backend) is the serverLayerName of this config
                // (see example above, that would be "hey.i.am.not.the.same.as.the.sublayer.id")
                const subLayer = generateClassForLayerConfig(
                    subLayerRawConfig,
                    subLayerRawConfig.serverLayerName,
                    allOtherLayers,
                    lang,
                    staging
                )
                if (subLayer) {
                    subLayers.push(
                        layerUtils.makeAggregateSubLayer({
                            subLayerId,
                            layer: subLayer,
                            minResolution: subLayerRawConfig.minResolution,
                            maxResolution: subLayerRawConfig.maxResolution,
                        })
                    )
                }
            })
            return layerUtils.makeGeoAdminAggregateLayer({
                name,
                id,
                opacity,
                isVisible: false,
                attributions,
                timeConfig,
                isHighlightable,
                hasTooltip,
                topics,
                subLayers,
                hasLegend: !!hasLegend,
                searchable,
            })
        }
        default:
            log.error('Unknown layer type', type)
    }
    return
}

/**
 * Loads the legend (HTML content) for this layer ID
 *
 * @param {String} lang The language in which the legend should be rendered
 * @param {String} layerId The unique layer ID used in our backends
 * @param {Staging} staging
 * @returns {Promise<String>} HTML content of the layer's legend
 */
export function getGeoadminLayerDescription(
    lang: string,
    layerId: string,
    staging: Staging = 'production'
): Promise<String> {
    return new Promise((resolve, reject) => {
        axios
            .get(
                `${getApi3BaseUrlForStaging(staging)}rest/services/all/MapServer/${layerId}/legend?lang=${lang}`
            )
            .then((response) => resolve(response.data))
            .catch((error) => {
                log.error('Error while retrieving the legend for the layer', layerId, error)
                reject(new Error(error))
            })
    })
}

/**
 * Loads the layer config from the backend and transforms it in classes defined in this API file
 *
 * @param {String} lang The ISO code for the lang in which the config should be loaded (required)
 * @param {Staging} staging
 */
export function loadGeoadminLayersConfig(
    lang: string,
    staging: Staging = 'production'
): Promise<GeoAdminLayer[]> {
    return new Promise((resolve, reject) => {
        const layersConfig: any[] = []
        axios
            .get(
                `${getApi3BaseUrlForStaging(staging)}rest/services/all/MapServer/layersConfig?lang=${lang}`
            )
            .then(({ data: rawLayersConfig }) => {
                if (Object.keys(rawLayersConfig).length > 0) {
                    Object.keys(rawLayersConfig).forEach((rawLayerId) => {
                        const rawLayer = rawLayersConfig[rawLayerId]
                        const layer = generateClassForLayerConfig(
                            rawLayer,
                            rawLayerId,
                            rawLayersConfig,
                            lang
                        )
                        if (layer) {
                            layersConfig.push(layer)
                        }
                    })
                    resolve(layersConfig)
                } else {
                    reject(
                        new Error('LayersConfig loaded from backend is not an defined or is empty')
                    )
                }
            })
            .catch((error) => {
                const message = 'Error while loading layers config from backend'
                log.error(message, error)
                reject(new Error(message))
            })
    })
}
