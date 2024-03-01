import getFeature from '@/api/features/features.api'
import ExternalWMSLayer from '@/api/layers/ExternalWMSLayer.class'
import ExternalWMTSLayer from '@/api/layers/ExternalWMTSLayer.class'
import GPXLayer from '@/api/layers/GPXLayer.class.js'
import KMLLayer from '@/api/layers/KMLLayer.class'
import { decodeExternalLayerParam } from '@/api/layers/layers-external.api'
import LayerTypes from '@/api/layers/LayerTypes.enum'
import AbstractParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/router/storeSync/abstractParamConfig.class'
import { parseLayersParam, transformLayerIntoUrlString } from '@/router/storeSync/layersParamParser'
import log from '@/utils/logging'

/**
 * @param {ActiveLayerConfig} parsedLayer Layer config parsed from URL
 * @param {AbstractLayer | null} currentLayer Current layer if it is found in active layers
 * @returns {KMLLayer | ExternalWMTSLayer | ExternalWMSLayer | null} Will return an instance of the
 *   corresponding layer if the given layer is an external one, otherwise returns `null`
 */
export function createLayerObject(parsedLayer, currentLayer) {
    const defaultOpacity = 1.0
    let layer = parsedLayer
    const [layerType, url, id] = parsedLayer.id.split('|').map(decodeExternalLayerParam)
    if (['KML', 'GPX', 'WMTS', 'WMS'].includes(layerType) && currentLayer) {
        // the layer is already present in the active layers, so simply update it instead of
        // replacing it. This allow to avoid reloading the data of the layer (e.g. KML name, external
        // layer display name) when using the browser history navigation.
        layer = currentLayer.clone()
        layer.visible = parsedLayer.visible
        // external layer have a default opacity of 1.0
        layer.opacity = parsedLayer.opacity ?? defaultOpacity
        if (parsedLayer.customAttributes?.adminId) {
            layer.adminId = parsedLayer.customAttributes.adminId
        }
    } else if (layerType === 'KML') {
        // format is KML|FILE_URL
        if (url.startsWith('http')) {
            layer = new KMLLayer({
                kmlFileUrl: url,
                visible: parsedLayer.visible,
                opacity: parsedLayer.opacity ?? defaultOpacity,
                adminId: parsedLayer.customAttributes.adminId,
            })
        } else {
            // If the url does not start with http, then it is a local file and we don't add it
            // to the layer list upon start as we cannot load it anymore.
            layer = null
        }
    }
    // format is GPX|FILE_URL
    else if (layerType === 'GPX') {
        if (url.startsWith('http')) {
            layer = new GPXLayer({
                gpxFileUrl: url,
                visible: parsedLayer.visible,
                opacity: parsedLayer.opacity ?? defaultOpacity,
            })
        } else {
            // we can't re-load GPX files loaded through a file import; this GPX file is ignored
            layer = null
        }
    }
    // format is WMTS|GET_CAPABILITIES_URL|LAYER_ID
    else if (layerType === 'WMTS') {
        layer = new ExternalWMTSLayer({
            name: id,
            opacity: parsedLayer.opacity,
            visible: parsedLayer.visible ?? defaultOpacity,
            baseUrl: url,
            externalLayerId: id,
        })
    }
    // format is : WMS|BASE_URL|LAYER_ID
    else if (layerType === 'WMS') {
        // here we assume that is a regular WMS layer, upon parsing of the WMS get capabilities
        // the layer might be updated to an external group of layers if needed.
        layer = new ExternalWMSLayer({
            name: id,
            opacity: parsedLayer.opacity,
            visible: parsedLayer.visible ?? defaultOpacity,
            baseUrl: url,
            externalLayerId: id,
        })
    }
    return layer
}

function dispatchLayersFromUrlIntoStore(store, urlParamValue) {
    const parsedLayers = parseLayersParam(urlParamValue)
    const promisesForAllDispatch = []
    log.debug(
        `Dispatch Layers from URL into store: ${urlParamValue}`,
        store.state.layers.activeLayers,
        parsedLayers
    )
    const featuresRequests = []
    const layers = parsedLayers.map((parsedLayer) => {
        // First check if we already have the layer in the active layers
        const currentLayer = store.getters.getActiveLayerById(parsedLayer.id)
        const layerObject = createLayerObject(parsedLayer, currentLayer)
        if (layerObject) {
            if (layerObject.type === LayerTypes.KML && layerObject.adminId) {
                promisesForAllDispatch.push(
                    store.dispatch('setShowDrawingOverlay', {
                        showDrawingOverlay: true,
                        dispatcher: STORE_DISPATCHER_ROUTER_PLUGIN,
                    })
                )
            }
            log.debug(`  Add layer ${parsedLayer.id} to active layers`, layerObject)
            if (layerObject.customAttributes?.features) {
                layerObject.customAttributes.features
                    .toString()
                    .split(':')
                    .forEach((featureId) => {
                        featuresRequests.push(
                            getFeature(
                                store.getters.getLayerConfigById(parsedLayer.id),
                                featureId,
                                store.state.position.projection,
                                store.state.i18n.lang
                            )
                        )
                    })
            }
        }
        return layerObject
    })

    promisesForAllDispatch.push(
        store.dispatch('setLayers', { layers: layers, dispatcher: STORE_DISPATCHER_ROUTER_PLUGIN })
    )
    if (featuresRequests.length > 0) {
        getAndDispatchFeatures(featuresRequests, store) // all features after promise
    }

    return Promise.all(promisesForAllDispatch)
}

async function getAndDispatchFeatures(featuresPromise, store) {
    const features = []
    try {
        const featuresReceived = await Promise.all(featuresPromise)
        if (featuresReceived.length > 0) {
            featuresReceived.forEach((feature) => {
                features.push(feature)
            })

            store.dispatch('setSelectedFeatures', {
                features: features,
                dispatcher: STORE_DISPATCHER_ROUTER_PLUGIN,
            })
        }
    } catch (error) {
        log.error(`Error while processing features in bod-layer-id router. error is ${error}`)
    }
}

function generateLayerUrlParamFromStoreValues(store) {
    return store.state.layers.activeLayers
        .map((layer) =>
            transformLayerIntoUrlString(
                layer,
                store.state.layers.config.find((config) => config.id === layer.id)
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
                'setLayerYear',
                'setLayers',
            ].join(','),
            dispatchLayersFromUrlIntoStore,
            generateLayerUrlParamFromStoreValues,
            true,
            String
        )
    }
}
