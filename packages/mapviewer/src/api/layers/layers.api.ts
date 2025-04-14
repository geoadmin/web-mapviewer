import { type LayerAttribution, LayerType, type GeoAdminGeoJSONLayer, type GeoAdminLayer, type AggregateSubLayer } from '@geoadmin/layers'
import { layerUtils, timeConfigUtils } from '@geoadmin/layers/utils'
import log from '@geoadmin/log'
import axios from 'axios'

import { getApi3BaseUrl, getWmtsBaseUrl } from '@/config/baseUrl.config'
import { DEFAULT_GEOADMIN_MAX_WMTS_RESOLUTION } from '@/config/map.config'

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
 *
 * @param layerConfig
 * @param id
 * @param allOtherLayers
 * @param lang
 * @returns {GeoAdminLayer}
 */
const generateClassForLayerConfig = (
    layerConfig: Record<string, any>,
    id: string,
    allOtherLayers: Record<string, any>,
    lang: string
): GeoAdminLayer | null => {
    if (!layerConfig) {
        return null
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
    const timeConfig =
        timestamps.length > 0
            ? timeConfigUtils.makeTimeConfig(layerConfig.timeBehaviour, timestamps)
            : null
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
            const layer = layerUtils.makeGeoAdminWMTSLayer({
                type: LayerType.WMTS,
                name,
                id,
                baseUrl: _urlWithTrailingSlash(getWmtsBaseUrl()),
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
            return layer
        }
        case 'wms': {
            const layer = layerUtils.makeGeoAdminWMSLayer({
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
            return layer
        }
        case 'geojson': {
            const layer: GeoAdminGeoJSONLayer = layerUtils.makeGeoAdminGeoJSONLayer({
                type: LayerType.GEOJSON,
                name,
                id,
                opacity,
                visible: false,
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
            return layer
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
                const subLayer: GeoAdminLayer | null = generateClassForLayerConfig(
                    subLayerRawConfig,
                    subLayerRawConfig.serverLayerName,
                    allOtherLayers,
                    lang
                )
                if (subLayer) {
                    subLayers.push(
                        layerUtils.makeAggregateSubLayer({
                            subLayerId,
                            layer: subLayer,
                            minResolution: subLayerRawConfig.minResolution,
                            maxResolution: subLayerRawConfig.maxResolution
                        })
                    )
                }
            })
            const layer = layerUtils.makeGeoAdminAggregateLayer({
                name,
                id,
                opacity,
                visible: false,
                attributions,
                timeConfig,
                isHighlightable,
                hasTooltip,
                topics,
                subLayers,
                hasLegend: !!hasLegend,
                searchable,
            })

            return layer
        }
        default:
            log.error('Unknown layer type', type)
    }
    return null
}

/**
 * Loads the legend (HTML content) for this layer ID
 *
 * @param {String} lang The language in which the legend should be rendered
 * @param {String} layerId The unique layer ID used in our backends
 * @returns {Promise<String>} HTML content of the layer's legend
 */
export const getLayerDescription = (lang: string, layerId: string) => {
    return new Promise((resolve, reject) => {
        axios
            .get(`${getApi3BaseUrl()}rest/services/all/MapServer/${layerId}/legend?lang=${lang}`)
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
 * @returns {Promise<GeoAdminLayer[]>}
 */
export const loadLayersConfigFromBackend = (lang: string) => {
    return new Promise((resolve, reject) => {
        if (!getApi3BaseUrl()) {
            // this could happen if we are testing the app in unit tests, we simply reject and do nothing
            reject(new Error('API base URL is undefined'))
        } else {
            const layersConfig: any[] = []
            axios
                .get(`${getApi3BaseUrl()}rest/services/all/MapServer/layersConfig?lang=${lang}`)
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
                            new Error(
                                'LayersConfig loaded from backend is not an defined or is empty'
                            )
                        )
                    }
                })
                .catch((error) => {
                    const message = 'Error while loading layers config from backend'
                    log.error(message, error)
                    reject(new Error(message))
                })
        }
    })
}
