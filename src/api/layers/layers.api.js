import { API_BASE_URL, WMTS_BASE_URL } from '@/config'
import axios from 'axios'
import log from '@/utils/logging'
import LayerTimeConfig from '@/api/layers/LayerTimeConfig.class'
import WMTSLayer from '@/api/layers/WMTSLayer.class'
import WMSLayer from '@/api/layers/WMSLayer.class'
import GeoJsonLayer from '@/api/layers/GeoJsonLayer.class'
import AggregateLayer, { AggregateSubLayer } from '@/api/layers/AggregateLayer.class'

// API file that covers the backend endpoint http://api3.geo.admin.ch/rest/services/all/MapServer/layersConfig
// TODO : implement loading of a cached CloudFront version for MVP

const generateClassForLayerConfig = (layerConfig, id, allOtherLayers, lang) => {
    let layer = undefined
    if (layerConfig) {
        const {
            label: name,
            type,
            opacity,
            format,
            background,
            highlightable: isHighlightable,
            tooltip: hasTooltip,
        } = layerConfig
        const timeConfig = new LayerTimeConfig(layerConfig.timeBehaviour, layerConfig.timestamps)
        const topics = layerConfig.topics ? layerConfig.topics.split(',') : []
        switch (type.toLowerCase()) {
            case 'wmts':
                layer = new WMTSLayer(
                    name,
                    id,
                    opacity,
                    format,
                    timeConfig,
                    !!background,
                    WMTS_BASE_URL,
                    isHighlightable,
                    hasTooltip,
                    topics
                )
                break
            case 'wms':
                layer = new WMSLayer(
                    name,
                    id,
                    opacity,
                    layerConfig.wmsUrl,
                    format,
                    timeConfig,
                    lang,
                    layerConfig.gutter,
                    isHighlightable,
                    hasTooltip,
                    topics
                )
                break
            case 'geojson':
                layer = new GeoJsonLayer(
                    name,
                    id,
                    opacity,
                    layerConfig.geojsonUrl,
                    layerConfig.styleUrl
                )
                break
            case 'aggregate':
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
                layer = new AggregateLayer(
                    name,
                    id,
                    opacity,
                    timeConfig,
                    isHighlightable,
                    hasTooltip,
                    topics
                )
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
                        layer.addSubLayer(
                            new AggregateSubLayer(
                                subLayerId,
                                subLayer,
                                subLayerRawConfig.minResolution,
                                subLayerRawConfig.maxResolution
                            )
                        )
                    }
                })

                break
            default:
                log('error', 'Unknown layer type', type)
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
export const getLayerLegend = (lang, layerId) => {
    return new Promise((resolve, reject) => {
        axios
            .get(`${API_BASE_URL}rest/services/all/MapServer/${layerId}/legend?lang=${lang}`)
            .then((response) => resolve(response.data))
            .catch((error) => {
                log('error', 'Error while retrieving the legend for the layer', layerId, error)
                reject(error)
            })
    })
}

/**
 * Loads the layers config from the backend and transforms it in classes defined in this API file
 *
 * @param {String} lang The ISO code for the lang in which the config should be loaded (required)
 * @returns {Promise<Layer[]>}
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
                    log('error', message, error)
                    reject(message)
                })
        }
    })
}
