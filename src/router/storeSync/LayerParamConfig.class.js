import { LayerAttribution } from '@/api/layers/AbstractLayer.class'
import ExternalWMSLayer from '@/api/layers/ExternalWMSLayer.class'
import ExternalWMTSLayer from '@/api/layers/ExternalWMTSLayer.class'
import KMLLayer from '@/api/layers/KMLLayer.class'

import AbstractParamConfig from '@/router/storeSync/abstractParamConfig.class'
import layersParamParser from '@/router/storeSync/layersParamParser'
import log from '@/utils/logging'

/**
 * Transform a layer metadata into a string. This value can then be used in the URL to describe a
 * layer and its state (visibility, opacity, etc...)
 *
 * @param {AbstractLayer} layer
 * @param {GeoAdminLayer} [defaultLayerConfig]
 * @returns {string}
 */
export function transformLayerIntoUrlString(layer, defaultLayerConfig) {
    let layerUrlString = layer.getID()
    if (layer.timeConfig && layer.timeConfig.series.length > 1) {
        layerUrlString += `@time=${layer.timeConfig.currentTimestamp}`
    }
    if (!layer.visible) {
        layerUrlString += `,f`
    }
    // if no default layers config (e.g. external layers) or if the opacity is not the same as the default one
    if (!defaultLayerConfig || layer.opacity !== defaultLayerConfig.opacity) {
        if (layer.visible) {
            layerUrlString += ','
        }
        layerUrlString += `,${layer.opacity}`
    }
    return layerUrlString
}

/**
 * Parse layers such as described in
 * https://github.com/geoadmin/web-mapviewer/blob/develop/adr/2021_03_16_url_param_structure.md#layerid
 *
 * @param {ActiveLayerConfig} parsedLayer
 * @returns {KMLLayer | ExternalWMTSLayer | ExternalWMSLayer | null} Will return an instance of the
 *   corresponding layer if the given layer is an external one, otherwise returns `null`
 */
export function transformParsedExternalLayerIntoObject(parsedLayer) {
    // format is :  KML|FILE_URL|LAYER_NAME
    if (parsedLayer.id.startsWith('KML|') && parsedLayer.id.split('|').length === 3) {
        const splitLayerId = parsedLayer.id.split('|')
        return new KMLLayer(
            splitLayerId[1], // kml url
            parsedLayer.visible,
            parsedLayer.opacity,
            null, // fileId, null := parsed from url
            parsedLayer.customAttributes.adminId,
            splitLayerId[2] // name
        )
    }
    // format is WMTS|GET_CAPABILITIES_URL|LAYER_ID|LAYER_NAME
    else if (parsedLayer.id.startsWith('WMTS|')) {
        const [externalLayerType, wmtsServerGetCapabilitiesUrl, wmtsLayerId, layerName] =
            parsedLayer.id.split('|')
        return new ExternalWMTSLayer(
            layerName,
            parsedLayer.opacity,
            parsedLayer.visible,
            wmtsServerGetCapabilitiesUrl,
            wmtsLayerId,
            // grabbing only the host name as attribution
            [
                new LayerAttribution(
                    new URL(decodeURIComponent(wmtsServerGetCapabilitiesUrl)).hostname
                ),
            ]
        )
    }
    // format is : WMS|BASE_URL|LAYER_IDS|WMS_VERSION|LAYER_NAME
    else if (parsedLayer.id.startsWith('WMS|')) {
        const [externalLayerType, wmsServerBaseURL, wmsLayerIds, wmsVersion, layerName] =
            parsedLayer.id.split('|')
        return new ExternalWMSLayer(
            layerName,
            parsedLayer.opacity,
            parsedLayer.visible,
            wmsServerBaseURL,
            wmsLayerIds,
            [new LayerAttribution(new URL(decodeURIComponent(wmsServerBaseURL)).hostname)],
            wmsVersion
        )
    }
}

function dispatchLayersFromUrlIntoStore(store, urlParamValue) {
    const parsedLayers = layersParamParser(urlParamValue)
    const promisesForAllDispatch = []
    log.debug(
        `Dispatch Layers from URL into store: ${urlParamValue}`,
        store.state.layers.activeLayers,
        parsedLayers
    )
    // going through layers that are already present to set opacity / visibility
    store.state.layers.activeLayers.forEach((activeLayer) => {
        const matchingLayerMetadata = parsedLayers.find((layer) => layer.id === activeLayer.getID())
        if (matchingLayerMetadata) {
            log.debug(
                `  Update layer ${activeLayer.getID()} parameters (visible, opacity,...); new:`,
                matchingLayerMetadata,
                `current:`,
                activeLayer
            )
            if (matchingLayerMetadata.opacity) {
                if (activeLayer.opacity !== matchingLayerMetadata.opacity) {
                    promisesForAllDispatch.push(
                        store.dispatch('setLayerOpacity', {
                            layerId: activeLayer.getID(),
                            opacity: matchingLayerMetadata.opacity,
                        })
                    )
                }
            } else {
                // checking if this active layer's opacity matches the default opacity from the config
                const configForThisLayer = store.getters.getLayerConfigById(activeLayer.getID())
                if (configForThisLayer && configForThisLayer.opacity !== activeLayer.opacity) {
                    promisesForAllDispatch.push(
                        store.dispatch('setLayerOpacity', {
                            layerId: activeLayer.getID(),
                            opacity: configForThisLayer.opacity,
                        })
                    )
                }
            }
            if (activeLayer.visible !== matchingLayerMetadata.visible) {
                promisesForAllDispatch.push(
                    store.dispatch('setLayerVisibility', {
                        layerId: activeLayer.getID(),
                        visible: matchingLayerMetadata.visible,
                    })
                )
            }
        } else {
            // this layer has to be removed (not present in the URL anymore)
            log.debug(`  Remove layer ${activeLayer.getID()} from active layers`)
            promisesForAllDispatch.push(store.dispatch('removeLayer', activeLayer.getID()))
        }
    })
    // adding any layer that is not present yet
    parsedLayers.forEach((layer) => {
        if (
            !store.state.layers.activeLayers.find((activeLayer) => activeLayer.getID() === layer.id)
        ) {
            // checking if it is an external layer first
            const externalLayer = transformParsedExternalLayerIntoObject(layer)
            if (externalLayer) {
                log.debug(`  Add external layer ${layer.id} to active layers`, externalLayer)
                promisesForAllDispatch.push(store.dispatch('addLayer', externalLayer))
            } else {
                // if internal (or BOD) layer, we add it through its parsed config
                log.debug(`  Add layer ${layer.id} to active layers`, layer)
                promisesForAllDispatch.push(store.dispatch('addLayer', layer))
            }
        }
    })
    // setting timestamps fore timed layers if specified in the URL
    parsedLayers
        .filter((layer) => layer.customAttributes && layer.customAttributes.time)
        .forEach((timedLayer) => {
            log.debug(`  Set timestamp to timed layer ${timedLayer.id}`, timedLayer)
            promisesForAllDispatch.push(
                store.dispatch('setTimedLayerCurrentTimestamp', {
                    layerId: timedLayer.id,
                    timestamp: timedLayer.customAttributes.time,
                })
            )
        })
    return Promise.all(promisesForAllDispatch)
}

function generateLayerUrlParamFromStoreValues(store) {
    return store.state.layers.activeLayers
        .map((layer) =>
            transformLayerIntoUrlString(
                layer,
                store.state.layers.config.find((config) => config.getID() === layer.getID())
            )
        )
        .join(';')
}

export default class LayerParamConfig extends AbstractParamConfig {
    constructor() {
        super(
            'layers',
            [
                'toggleLayerVisibility',
                'addLayer',
                'removeLayerWithId',
                'clearLayers',
                'moveActiveLayerFromIndexToIndex',
                'setLayerOpacity',
                'setLayerTimestamp',
            ].join(','),
            dispatchLayersFromUrlIntoStore,
            generateLayerUrlParamFromStoreValues,
            false,
            String
        )
    }
}
