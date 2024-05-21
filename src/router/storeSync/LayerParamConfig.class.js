import getFeature from '@/api/features/features.api'
import ExternalWMSLayer from '@/api/layers/ExternalWMSLayer.class'
import ExternalWMTSLayer from '@/api/layers/ExternalWMTSLayer.class'
import GPXLayer from '@/api/layers/GPXLayer.class'
import KMLLayer from '@/api/layers/KMLLayer.class'
import LayerTypes from '@/api/layers/LayerTypes.enum'
import AbstractParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/router/storeSync/abstractParamConfig.class'
import {
    orderFeaturesByLayers,
    parseLayersParam,
    transformLayerIntoUrlString,
} from '@/router/storeSync/layersParamParser'
import { getExtentOfGeometries } from '@/utils/geoJsonUtils'
import log from '@/utils/logging'

/**
 * Parse layers such as described in
 * https://github.com/geoadmin/web-mapviewer/blob/develop/adr/2021_03_16_url_param_structure.md#layerid
 *
 * @param {ActiveLayerConfig} parsedLayer Layer config parsed from URL
 * @param {AbstractLayer | null} currentLayer Current layer if it is found in active layers
 * @returns {KMLLayer | ExternalWMTSLayer | ExternalWMSLayer | null | ActiveLayerConfig} Will return
 *   an instance of the corresponding layer if the given layer is an external one, returns null if
 *   this external layer can't be "reloaded" from URL (i.e. KML/GPX added through local file) or
 *   will return the untouched ActiveLayerConfig for other layer types
 */
export function createLayerObject(parsedLayer, currentLayer) {
    const defaultOpacity = 1.0
    if (
        [LayerTypes.KML, LayerTypes.GPX, LayerTypes.WMTS, LayerTypes.WMS].includes(
            parsedLayer.type
        ) &&
        currentLayer
    ) {
        // the layer is already present in the active layers, so simply update it instead of
        // replacing it. This avoids reloading the data of the layer (e.g. KML name, external
        // layer display name) when using the browser history navigation.
        const layer = currentLayer.clone()
        layer.visible = parsedLayer.visible
        // external layer have a default opacity of 1.0
        layer.opacity = parsedLayer.opacity ?? defaultOpacity
        if (parsedLayer.customAttributes?.adminId) {
            layer.adminId = parsedLayer.customAttributes.adminId
        }
        return layer
    } else if (parsedLayer.type === LayerTypes.KML) {
        // format is KML|FILE_URL
        if (parsedLayer.baseUrl.startsWith('http')) {
            return new KMLLayer({
                kmlFileUrl: parsedLayer.baseUrl,
                visible: parsedLayer.visible,
                opacity: parsedLayer.opacity ?? defaultOpacity,
                adminId: parsedLayer.customAttributes?.adminId,
            })
        } else {
            // If the url does not start with http, then it is a local file and we don't add it
            // to the layer list upon start as we cannot load it anymore.
            return null
        }
    }
    // format is GPX|FILE_URL
    else if (parsedLayer.type === LayerTypes.GPX) {
        if (parsedLayer.baseUrl.startsWith('http')) {
            return new GPXLayer({
                gpxFileUrl: parsedLayer.baseUrl,
                visible: parsedLayer.visible,
                opacity: parsedLayer.opacity ?? defaultOpacity,
            })
        } else {
            // we can't re-load GPX files loaded through a file import; this GPX file is ignored
            return null
        }
    }
    // format is WMTS|GET_CAPABILITIES_URL|LAYER_ID
    else if (parsedLayer.type === LayerTypes.WMTS) {
        const { year = null } = parsedLayer.customAttributes ?? {}
        return new ExternalWMTSLayer({
            id: parsedLayer.id,
            name: parsedLayer.id,
            opacity: parsedLayer.opacity,
            visible: parsedLayer.visible ?? defaultOpacity,
            baseUrl: parsedLayer.baseUrl,
            currentYear: year,
        })
    }
    // format is : WMS|BASE_URL|LAYER_ID
    else if (parsedLayer.type === LayerTypes.WMS) {
        const { year = null } = parsedLayer.customAttributes ?? {}
        // here we assume that is a regular WMS layer, upon parsing of the WMS get capabilities
        // the layer might be updated to an external group of layers if needed.
        return new ExternalWMSLayer({
            id: parsedLayer.id,
            name: parsedLayer.id,
            opacity: parsedLayer.opacity,
            visible: parsedLayer.visible ?? defaultOpacity,
            baseUrl: parsedLayer.baseUrl,
            currentYear: year,
        })
    }
    // this is no external layer that needs further parsing, we let it go through to be looked up in the layers config
    return parsedLayer
}

function dispatchLayersFromUrlIntoStore(to, store, urlParamValue) {
    const parsedLayers = parseLayersParam(urlParamValue)
    const promisesForAllDispatch = []
    log.debug(
        `Dispatch Layers from URL into store: ${urlParamValue}`,
        store.state.layers.activeLayers,
        parsedLayers
    )
    const featuresRequests = []
    const layers = parsedLayers.map((parsedLayer, index) => {
        // First check if we already have the layer in the active layers
        const currentLayer = store.getters.getActiveLayerByIndex(index)
        const layerObject = createLayerObject(parsedLayer, currentLayer)
        if (layerObject) {
            if (layerObject.type === LayerTypes.KML && layerObject.adminId) {
                promisesForAllDispatch.push(
                    store.dispatch('setShowDrawingOverlay', {
                        show: true,
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
        promisesForAllDispatch.push(getAndDispatchFeatures(to, featuresRequests, store))
    }

    return Promise.all(promisesForAllDispatch)
}

async function getAndDispatchFeatures(to, featuresPromise, store) {
    try {
        const responses = await Promise.allSettled(featuresPromise)
        const features = responses
            .filter((response) => response.status === 'fulfilled')
            .map((response) => response.value)
        if (features.length > 0) {
            await store.dispatch('setSelectedFeatures', {
                features: features,
                dispatcher: STORE_DISPATCHER_ROUTER_PLUGIN,
            })

            const extent = getExtentOfGeometries(features.map((feature) => feature.geometry))
            // If the zoom level has been specifically set to a level, we don't want to override that.
            // otherwise, we go to the zoom level which encompass all features
            const query = to.query
            if (!query.z) {
                await store.dispatch('zoomToExtent', {
                    extent: extent,
                    maxZoom: 8,
                    dispatcher: STORE_DISPATCHER_ROUTER_PLUGIN,
                })
            } else {
                const center = [
                    [(extent[0][0] + extent[1][0]) / 2],
                    [(extent[0][1] + extent[1][1]) / 2],
                ]
                await store.dispatch('setCenter', {
                    center: center,
                    dispatcher: STORE_DISPATCHER_ROUTER_PLUGIN,
                })
            }
        }
    } catch (error) {
        log.error(`Error while processing features in feature preselection. error is ${error}`)
    }
}

function generateLayerUrlParamFromStoreValues(store) {
    const featuresIds = orderFeaturesByLayers(store.getters.selectedFeatures)
    return store.state.layers.activeLayers
        .map((layer) =>
            transformLayerIntoUrlString(
                layer,
                store.state.layers.config.find((config) => config.id === layer.id),
                featuresIds[layer.id]
            )
        )
        .join(';')
}

export default class LayerParamConfig extends AbstractParamConfig {
    constructor() {
        super({
            urlParamName: 'layers',
            mutationsToWatch: [
                'toggleLayerVisibility',
                'addLayer',
                'removeLayersById',
                'removeLayerByIndex',
                'clearLayers',
                'moveActiveLayerToIndex',
                'setLayerOpacity',
                'setLayerYear',
                'setLayers',
                'setSelectedFeatures',
                'addSelectedFeatures',
            ],
            setValuesInStore: dispatchLayersFromUrlIntoStore,
            extractValueFromStore: generateLayerUrlParamFromStoreValues,
            keepInUrlWhenDefault: true,
            valueType: String,
        })
    }
}
