import axios from 'axios'

import { LayerAttribution } from '@/api/layers/AbstractLayer.class'
import GeoAdminAggregateLayer, {
    AggregateSubLayer,
} from '@/api/layers/GeoAdminAggregateLayer.class'
import GeoAdminGeoJsonLayer from '@/api/layers/GeoAdminGeoJsonLayer.class'
import GeoAdminWMSLayer from '@/api/layers/GeoAdminWMSLayer.class'
import GeoAdminWMTSLayer from '@/api/layers/GeoAdminWMTSLayer.class'
import LayerTimeConfig from '@/api/layers/LayerTimeConfig.class'
import LayerTimeConfigEntry from '@/api/layers/LayerTimeConfigEntry.class'
import { API_BASE_URL, WMTS_BASE_URL } from '@/config'
import log from '@/utils/logging'

// API file that covers the backend endpoint http://api3.geo.admin.ch/rest/services/all/MapServer/layersConfig
// TODO : implement loading of a cached CloudFront version for MVP

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
const generateClassForLayerConfig = (layerConfig, id, allOtherLayers, lang) => {
    let layer = undefined
    if (layerConfig) {
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
        } catch (_) {
            // this is not a well-formed URL, we do nothing with it
        }
        const timestamps = []
        if (Array.isArray(layerConfig.timestamps) && layerConfig.timestamps.length > 1) {
            timestamps.push(
                ...layerConfig.timestamps.map((timestamp) => new LayerTimeConfigEntry(timestamp))
            )
        }
        const timeConfig = new LayerTimeConfig(layerConfig.timeBehaviour, timestamps)
        const topics = layerConfig.topics ? layerConfig.topics.split(',') : []
        const attributions = []
        if (attributionName) {
            attributions.push(new LayerAttribution(attributionName, attributionUrl))
        }
        switch (type.toLowerCase()) {
            case 'vector':
                log.info('Vector layer format is TBD in our backends')
                break
            case 'wmts':
                layer = new GeoAdminWMTSLayer({
                    name,
                    geoAdminId: id,
                    technicalName: serverLayerName,
                    opacity,
                    visible: false,
                    attributions,
                    format,
                    timeConfig,
                    isBackground: !!isBackground,
                    baseUrl: WMTS_BASE_URL,
                    isHighlightable,
                    hasTooltip,
                    topics,
                    hasLegend: !!hasLegend,
                    searchable: !!searchable,
                })
                break
            case 'wms':
                layer = new GeoAdminWMSLayer({
                    name,
                    geoAdminId: id,
                    technicalName: serverLayerName,
                    opacity,
                    visible: false,
                    attributions,
                    baseUrl: layerConfig.wmsUrl,
                    format,
                    timeConfig,
                    wmsVersion: '1.3.0',
                    lang,
                    gutter: layerConfig.gutter,
                    isHighlightable,
                    hasTooltip,
                    topics,
                    hasLegend: !!hasLegend,
                    searchable: !!searchable,
                })
                break
            case 'geojson':
                layer = new GeoAdminGeoJsonLayer({
                    name,
                    id,
                    opacity,
                    visible: false,
                    attributions,
                    geoJsonUrl: layerConfig.geojsonUrl,
                    styleUrl: layerConfig.styleUrl,
                    updateDelay: layerConfig.updateDelay,
                    hasLegend: !!hasLegend,
                })
                break
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
                const subLayers = []
                layerConfig.subLayersIds.forEach((subLayerId) => {
                    // each subLayerId is one of the "subLayersIds", so "i.am.a.sub.layer_1" or "i.am.a.sub.layer_2" from the example above
                    const subLayerRawConfig = allOtherLayers[subLayerId]
                    // the "real" layer ID (the one that will be used to request the backend) is the serverLayerName of this config
                    // (see example above, that would be "hey.i.am.not.the.same.as.the.sublayer.id")
                    const subLayer = generateClassForLayerConfig(
                        subLayerRawConfig,
                        subLayerRawConfig.serverLayerName,
                        allOtherLayers,
                        lang
                    )
                    if (subLayer) {
                        subLayers.push(
                            new AggregateSubLayer(
                                subLayerId,
                                subLayer,
                                subLayerRawConfig.minResolution,
                                subLayerRawConfig.maxResolution
                            )
                        )
                    }
                })
                layer = new GeoAdminAggregateLayer({
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
                })

                break
            }
            default:
                log.error('Unknown layer type', type)
        }
    }
    return layer
}

/**
 * Loads the legend (HTML content) for this layer ID
 *
 * @param {String} lang The language in which the legend should be rendered
 * @param {String} layerId The unique layer ID used in our backends
 * @returns {Promise<String>} HTML content of the layer's legend
 */
export const getLayerDescription = (lang, layerId) => {
    return new Promise((resolve, reject) => {
        axios
            .get(`${API_BASE_URL}rest/services/all/MapServer/${layerId}/legend?lang=${lang}`)
            .then((response) => resolve(response.data))
            .catch((error) => {
                log.error('Error while retrieving the legend for the layer', layerId, error)
                reject(error)
            })
    })
}

/**
 * Loads the layer config from the backend and transforms it in classes defined in this API file
 *
 * @param {String} lang The ISO code for the lang in which the config should be loaded (required)
 * @returns {Promise<GeoAdminLayer[]>}
 */
export const loadLayersConfigFromBackend = (lang) => {
    return new Promise((resolve, reject) => {
        if (!API_BASE_URL) {
            // this could happen if we are testing the app in unit tests, we simply reject and do nothing
            reject('API base URL is undefined')
        } else {
            const layersConfig = []
            axios
                .get(`${API_BASE_URL}rest/services/all/MapServer/layersConfig?lang=${lang}`)
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
                        reject('LayersConfig loaded from backend is not an defined or is empty')
                    }
                })
                .catch((error) => {
                    const message = 'Error while loading layers config from backend'
                    log.error(message, error)
                    reject(message)
                })
        }
    })
}
