import { getStandardValidationResponse } from '@/api/errorQueues.api'
import getFeature from '@/api/features/features.api'
import ExternalWMSLayer from '@/api/layers/ExternalWMSLayer.class'
import ExternalWMTSLayer from '@/api/layers/ExternalWMTSLayer.class'
import GeoAdminWMSLayer from '@/api/layers/GeoAdminWMSLayer.class'
import GeoTIFFLayer from '@/api/layers/GeoTIFFLayer.class.js'
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
import { flattenExtent } from '@/utils/coordinates/coordinateUtils.js'
import ErrorMessage from '@/utils/ErrorMessage.class'
import { getExtentOfGeometries } from '@/utils/geoJsonUtils'
import log from '@/utils/logging'
import WarningMessage from '@/utils/WarningMessage.class'

/**
 * Parse layers such as described in
 * https://github.com/geoadmin/web-mapviewer/blob/develop/adr/2021_03_16_url_param_structure.md#layerid
 *
 * @param {ActiveLayerConfig} parsedLayer Layer config parsed from URL
 * @param {AbstractLayer | null} currentLayer Current layer if it is found in active layers
 * @param {Store} store Vuex store
 * @param {[Promise<LayerFeature>]} featuresRequests Array of getFeature() promises
 * @returns {KMLLayer | ExternalWMTSLayer | ExternalWMSLayer | null | ActiveLayerConfig} Will return
 *   an instance of the corresponding layer if the given layer is an external one, returns null if
 *   this external layer can't be "reloaded" from URL (i.e. KML/GPX added through local file) or
 *   will return the untouched ActiveLayerConfig for other layer types
 */
export function createLayerObject(parsedLayer, currentLayer, store, featuresRequests) {
    const { year, updateDelay, features, adminId, ...customAttributes } =
        parsedLayer.customAttributes ?? {}
    const defaultOpacity = 1.0
    let layer = null

    if (currentLayer && (currentLayer.isExternal || currentLayer instanceof KMLLayer)) {
        // the layer is already present in the active layers, so simply update it instead of
        // replacing it. This avoids reloading the data of the layer (e.g. KML name, external
        // layer display name) when using the browser history navigation.
        layer = currentLayer.clone()
        layer.visible = parsedLayer.visible
        // external layer have a default opacity of 1.0
        layer.opacity = parsedLayer.opacity ?? defaultOpacity
        if (adminId) {
            layer.adminId = adminId
        }
    } else if (parsedLayer.type === LayerTypes.KML) {
        // format is KML|FILE_URL
        if (parsedLayer.baseUrl.startsWith('http')) {
            layer = new KMLLayer({
                kmlFileUrl: parsedLayer.baseUrl,
                visible: parsedLayer.visible,
                opacity: parsedLayer.opacity ?? defaultOpacity,
                adminId: adminId,
            })
        } else {
            // If the url does not start with http, then it is a local file and we don't add it
            // to the layer list upon start as we cannot load it anymore.
        }
    }
    // format is GPX|FILE_URL
    else if (parsedLayer.type === LayerTypes.GPX) {
        if (parsedLayer.baseUrl.startsWith('http')) {
            layer = new GPXLayer({
                gpxFileUrl: parsedLayer.baseUrl,
                visible: parsedLayer.visible,
                opacity: parsedLayer.opacity ?? defaultOpacity,
            })
        } else {
            // we can't re-load GPX files loaded through a file import; this GPX file is ignored
        }
    } else if (parsedLayer.type === LayerTypes.GEOTIFF) {
        // format is GEOTIFF|FILE_URL
        if (parsedLayer.baseUrl.startsWith('http')) {
            layer = new GeoTIFFLayer({
                fileSource: parsedLayer.baseUrl,
                visible: parsedLayer.visible,
                opacity: parsedLayer.opacity ?? defaultOpacity,
            })
        }
    }
    // format is WMTS|GET_CAPABILITIES_URL|LAYER_ID
    else if (parsedLayer.type === LayerTypes.WMTS) {
        layer = new ExternalWMTSLayer({
            id: parsedLayer.id,
            name: parsedLayer.id,
            opacity: parsedLayer.opacity ?? defaultOpacity,
            visible: parsedLayer.visible,
            baseUrl: parsedLayer.baseUrl,
            currentYear: year,
        })
    }
    // format is : WMS|BASE_URL|LAYER_ID
    else if (parsedLayer.type === LayerTypes.WMS) {
        // here we assume that is a regular WMS layer, upon parsing of the WMS get capabilities
        // the layer might be updated to an external group of layers if needed.
        layer = new ExternalWMSLayer({
            id: parsedLayer.id,
            name: parsedLayer.id,
            opacity: parsedLayer.opacity ?? defaultOpacity,
            visible: parsedLayer.visible,
            baseUrl: parsedLayer.baseUrl,
            currentYear: year,
            customAttributes,
        })
    } else {
        // Finally check if this is a Geoadmin layer
        layer = store.getters.getLayerConfigById(parsedLayer.id)?.clone()
        if (layer) {
            layer.visible = parsedLayer.visible
            if (parsedLayer.opacity !== undefined) {
                layer.opacity = parsedLayer.opacity
            }
            if (year !== undefined && layer.timeConfig) {
                layer.timeConfig.updateCurrentTimeEntry(layer.timeConfig.getTimeEntryForYear(year))
            }

            // If we have a WMS layer add extra params from custom attributes
            if (layer instanceof GeoAdminWMSLayer) {
                layer.setCustomAttributes(customAttributes)
            }
        }
    }

    // If we have a layer parse extra parameters that could be used by any type of layer
    if (layer) {
        if (updateDelay !== undefined) {
            layer.updateDelay = updateDelay
        }

        // only highlightable feature will output something, for the others a click coordinate is required
        // (and we don't have it if we are here, as we are dealing with pre-selected feature in the URL at app startup)
        if (layer.isHighlightable && features !== undefined) {
            features
                .toString()
                .split(':')
                .forEach((featureId) => {
                    featuresRequests.push(
                        getFeature(layer, featureId, store.state.position.projection, {
                            lang: store.state.i18n.lang,
                            screenWidth: store.state.ui.width,
                            screenHeight: store.state.ui.height,
                            mapExtent: flattenExtent(store.getters.extent),
                        })
                    )
                })
        }
    } else {
        log.error(
            `Invalid layer ${parsedLayer.id} parsed from the URL, layer is not found in layer config and is not external`
        )
    }

    return layer
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
    const layers = parsedLayers
        .map((parsedLayer, index) => {
            // First check if we already have the layer in the active layers
            const layerAtIndex = store.getters.getActiveLayerByIndex(index)
            const currentLayer = layerAtIndex?.id === parsedLayer.id ? layerAtIndex : null
            const layerObject = createLayerObject(
                parsedLayer,
                currentLayer,
                store,
                featuresRequests
            )
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
            }
            return layerObject
        })
        .filter((layer) => !!layer)

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
                    maxZoom: store.state.position.projection.get1_25000ZoomLevel(),
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

// this one differs from the usual validateUrlInput, as it handles each layer separately, telling the user
// which layer won't render. It's basic, which means it will only tells the user when he gives a non
// external layer that doesn't exist, or when he forgets the scheme for its external layer.
function validateUrlInput(store, query) {
    if (query === '') {
        return {
            valid: true,
            errors: null,
        }
    }
    const parsed = parseLayersParam(query)
    const url_matcher = /https?:\/\//
    const faultyLayers = []
    const localLayers = []
    parsed
        .filter((layer) => !store.getters.getLayerConfigById(layer.id))
        .forEach((layer) => {
            if (!layer.baseUrl) {
                faultyLayers.push(new ErrorMessage('url_layer_error', { layer: layer.id }))
            } else if (!layer.baseUrl?.match(url_matcher)?.length > 0) {
                localLayers.push(
                    new WarningMessage('url_external_layer_no_scheme_warning', {
                        layer: `${layer.type}|${layer.baseUrl}`,
                    })
                )
            }
        })
    const valid = faultyLayers.length < parsed.length
    if (!valid) {
        return getStandardValidationResponse(query, valid, this.urlParamName)
    }
    return {
        valid,
        errors: faultyLayers.length === 0 ? null : faultyLayers,
        warnings: localLayers.length === 0 ? null : localLayers,
    }
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
            validateUrlInput: validateUrlInput,
        })
    }
}
