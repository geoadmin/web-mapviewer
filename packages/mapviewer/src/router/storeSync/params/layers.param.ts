import type { Pinia } from 'pinia'

import {
    type CloudOptimizedGeoTIFFLayer,
    DEFAULT_OPACITY,
    type ExternalWMSLayer,
    type ExternalWMTSLayer,
    type GeoAdminGeoJSONLayer,
    type GeoAdminLayer,
    type GPXLayer,
    type KMLLayer,
    type Layer,
    LayerType,
} from '@geoadmin/layers'
import { layerUtils, timeConfigUtils } from '@geoadmin/layers/utils'
import log, { LogPreDefinedColor } from '@geoadmin/log'
import { ErrorMessage, WarningMessage } from '@geoadmin/log/Message'
import * as vueRouter from 'vue-router'

import getFeature from '@/api/features/features.api.ts'
import LayerFeature from '@/api/features/LayerFeature.class.ts'
import {
    orderFeaturesByLayers,
    parseLayersParam,
    transformLayerIntoUrlString,
} from '@/router/storeSync/layersParamParser.ts'
import UrlParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/router/storeSync/UrlParamConfig.class'
import {
    getDefaultValidationResponse,
    type ValidationResponse,
} from '@/router/storeSync/validation'
import { useLayersStore } from '@/store/modules/layers.store.ts'
import { usePositionStore } from '@/store/modules/position.store.ts'
import { useUIStore } from '@/store/modules/ui.store.ts'
import { flattenExtent } from '@/utils/extentUtils'
import { getExtentOfGeometries } from '@/utils/geoJsonUtils'
import { makeKmlLayer } from '@/utils/kmlUtils.ts'

function createWMTSLayerObject(parsedLayer: Record<string, any>): ExternalWMTSLayer {
    const { year } = parsedLayer.customAttributes ?? { year: undefined }

    return layerUtils.makeExternalWMTSLayer({
        type: LayerType.WMTS,
        id: parsedLayer.id,
        name: parsedLayer.id,
        opacity: parsedLayer.opacity,
        isVisible: parsedLayer.isVisible,
        baseUrl: parsedLayer.baseUrl,
        currentYear: year,
    })
}

function createWMSLayerObject(parsedLayer: Record<string, any>): ExternalWMSLayer {
    const { year, customAttributes } = parsedLayer

    // here we assume that is a regular WMS layer, upon parsing of the WMS get capabilities
    // the layer might be updated to an external group of layers if needed.
    return layerUtils.makeExternalWMSLayer({
        id: parsedLayer.id,
        name: parsedLayer.id,
        opacity: parsedLayer.opacity ?? DEFAULT_OPACITY,
        isVisible: parsedLayer.isVisible,
        baseUrl: parsedLayer.baseUrl,
        currentYear: year,
        customAttributes,
    })
}

function createKmlLayer(parsedLayer: Record<string, any>, adminId: string | undefined): KMLLayer {
    return makeKmlLayer({
        kmlFileUrl: parsedLayer.baseUrl,
        isVisible: parsedLayer.isVisible,
        opacity: parsedLayer.opacity ?? DEFAULT_OPACITY,
        adminId: adminId,
        style: parsedLayer.customAttributes?.style ?? undefined,
    })
}

function createGPGXLayer(parsedLayer: Record<string, any>): GPXLayer {
    const layer = layerUtils.makeGPXLayer({
        gpxFileUrl: parsedLayer.baseUrl,
        isVisible: parsedLayer.isVisible,
        opacity: parsedLayer.opacity ?? DEFAULT_OPACITY,
    })
    return layer
}

function createCloudOptimizedGeoTIFFLayer(
    layer: any,
    parsedLayer: Partial<Layer>
): CloudOptimizedGeoTIFFLayer {
    layer = layerUtils.makeCloudOptimizedGeoTIFFLayer({
        fileSource: parsedLayer.baseUrl,
        isVisible: parsedLayer.isVisible,
        opacity: parsedLayer.opacity ?? DEFAULT_OPACITY,
        isLoading: false,
    })
    return layer
}

/**
 * Parse layers such as described in
 * https://github.com/geoadmin/web-mapviewer/blob/develop/adr/2021_03_16_url_param_structure.md#layerid
 *
 * @returns Will return an instance of the corresponding layer if the given layer is an external
 *   one, returns null if this external layer can't be "reloaded" from URL (i.e. KML/GPX added
 *   through local file) or will return the untouched ActiveLayerConfig for other layer types
 */
export function createLayerObject(parsedLayer: Partial<Layer>, currentLayer: Layer) {
    const {
        year = null,
        updateDelay,
        features,
        adminId,
        ...customAttributes
    } = parsedLayer.customAttributes ?? {}

    let layer: Layer | undefined

    if (currentLayer && (currentLayer.isExternal || currentLayer.type === LayerType.KML)) {
        // the layer is already present in the active layers, so simply update it instead of
        // replacing it. This avoids reloading the data of the layer (e.g. KML name, external
        // layer display name) when using the browser history navigation.
        layer = layerUtils.cloneLayer(currentLayer as KMLLayer)
        layer.isVisible = parsedLayer.isVisible ?? false
        // external layer have a default opacity of 1.0
        layer.opacity = parsedLayer.opacity ?? DEFAULT_OPACITY

        if (adminId) {
            layer.adminId = adminId
        }
    } else if (parsedLayer.type === LayerType.KML) {
        // format is KML|FILE_URL
        if (parsedLayer.baseUrl?.startsWith('http')) {
            layer = createKmlLayer(parsedLayer, adminId)
        } else {
            // If the url does not start with http, then it is a local file and we don't add it
            // to the layer list upon start as we cannot load it anymore.
        }
    }
    // format is GPX|FILE_URL
    else if (parsedLayer.type === LayerType.GPX) {
        if (parsedLayer.baseUrl?.startsWith('http')) {
            layer = createGPGXLayer(parsedLayer)
        } else {
            // we can't re-load GPX files loaded through a file import; this GPX file is ignored
        }
    } else if (parsedLayer.type === LayerType.COG) {
        // format is GEOTIFF|FILE_URL
        if (parsedLayer.baseUrl?.startsWith('http')) {
            layer = createCloudOptimizedGeoTIFFLayer(layer, parsedLayer)
        }
    }
    // format is WMTS|GET_CAPABILITIES_URL|LAYER_ID
    else if (parsedLayer.type === LayerType.WMTS) {
        layer = createWMTSLayerObject(parsedLayer)
    }
    // format is : WMS|BASE_URL|LAYER_ID
    else if (parsedLayer.type === LayerType.WMS) {
        layer = createWMSLayerObject(parsedLayer)
    } else {
        // Finally check if this is a Geoadmin layer
        layer = layerUtils.cloneLayer(store.getters.getLayerConfigById(parsedLayer.id))
        if (layer) {
            layer.isVisible = parsedLayer.isVisible ?? false
            if (parsedLayer.opacity !== undefined) {
                layer.opacity = parsedLayer.opacity
            }
            if (year !== undefined && year !== null && layer.timeConfig) {
                const _year = typeof year === 'string' ? parseInt(year) : year
                const timeEntry = timeConfigUtils.getTimeEntryForYear(layer.timeConfig, _year)
                if (timeEntry) {
                    timeConfigUtils.updateCurrentTimeEntry(layer.timeConfig, timeEntry)
                }
            }

            // If we have a WMS layer add extra params from custom attributes
            if (layer.type === LayerType.WMS) {
                layer.customAttributes = customAttributes
            }
        }
    }

    const featuresRequests: Promise<LayerFeature>[] = []

    // If we have a layer parse extra parameters that could be used by any type of layer
    if (layer) {
        if (updateDelay !== undefined) {
            ;(layer as GeoAdminGeoJSONLayer).updateDelay = updateDelay
        }

        // only highlightable feature will output something, for the others a click coordinate is required
        // (and we don't have it if we are here, as we are dealing with pre-selected feature in the URL at app startup)
        if ((layer as GeoAdminLayer).isHighlightable && features !== undefined) {
            const positionStore = usePositionStore()
            const uiStore = useUIStore()
            features
                .toString()
                .split(':')
                .forEach((featureId) => {
                    featuresRequests.push(
                        getFeature(layer, featureId, positionStore.projection, {
                            lang: store.state.i18n.lang,
                            screenWidth: uiStore.width,
                            screenHeight: uiStore.height,
                            mapExtent: flattenExtent(positionStore.extent()),
                        })
                    )
                })
        }
    } else {
        log.error(
            `Invalid layer ${parsedLayer.id} parsed from the URL, layer is not found in layer config and is not external`
        )
    }

    return { layer, featuresRequests }
}

function dispatchLayersFromUrlIntoStore(to: vueRouter.RouteLocation, urlParamValue: string) {
    const parsedLayers = parseLayersParam(urlParamValue)
    const promisesForAllDispatch = []

    const layerStore = useLayersStore()

    log.debug({
        title: 'Layers URL param / dispatchLayersFromUrlIntoStore',
        titleStlye: {
            backgroundColor: LogPreDefinedColor.Sky,
        },
        messages: [
            `Dispatch Layers from URL into store: ${urlParamValue}`,
            layerStore.activeLayers,
            parsedLayers,
        ],
    })
    const featuresRequests: Promise<LayerFeature>[] = []

    const layers = parsedLayers
        .map((parsedLayer, index) => {
            // First check if we already have the layer in the active layers
            const layerAtIndex = store.getters.getActiveLayerByIndex(index)
            const currentLayer = layerAtIndex?.id === parsedLayer.id ? layerAtIndex : null

            const { layer: layerObject, featuresRequests: layerFeatureRequests } =
                createLayerObject(
                    parsedLayer,
                    currentLayer,
                    store
                    // featuresRequests
                )

            if (layerFeatureRequests) {
                featuresRequests.push(...layerFeatureRequests)
            }

            if (layerObject) {
                if (layerObject.type === LayerType.KML && layerObject.adminId) {
                    promisesForAllDispatch.push(
                        store.dispatch('setShowDrawingOverlay', {
                            show: true,
                            dispatcher: STORE_DISPATCHER_ROUTER_PLUGIN,
                        })
                    )

                    promisesForAllDispatch.push(
                        store.dispatch('setIsVisitWithAdminId', {
                            value: true,
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

async function getAndDispatchFeatures(
    to: vueRouter.RouteLocation,
    featuresPromise: Promise<LayerFeature>[],
    store: ReturnType<useStore>
) {
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
        log.error(
            `Error while processing features in feature preselection. error is ${error?.toString()}`
        )
    }
}

function generateLayerUrlParamFromStoreValues(store: Pinia): string {
    const featuresIds = orderFeaturesByLayers(store.getters.selectedFeatures) as Record<
        string,
        string[]
    >

    return store.state.layers.activeLayers
        .map((layer: Layer) =>
            transformLayerIntoUrlString(
                layer,
                store.state.layers.config.find((config: Layer) => config.id === layer.id),
                featuresIds[layer.id]
            )
        )
        .join(';')
}

/**
 * This one differs from the usual validateUrlInput, as it handles each layer separately. It will
 * tell the user which layer won't render. It's basic, which means it will only tell the user when
 * he gives a non-external layer that doesn't exist, or when he forgets the scheme for its external
 * layer.
 */
export function validateUrlInput(
    this: UrlParamConfig,
    store: Pinia,
    query: string
): ValidationResponse {
    if (query === '') {
        return {
            valid: true,
            errors: null,
        }
    }
    const parsed = parseLayersParam(query)
    const url_matcher = /https?:\/\//
    const faultyLayers: ErrorMessage[] = []
    const localLayers: WarningMessage[] = []
    parsed
        .filter((layer) => !store.getters.getLayerConfigById(layer.id))
        .forEach((layer) => {
            if (!layer.baseUrl) {
                faultyLayers.push(new ErrorMessage('url_layer_error', { layer: layer.id }))
            } else if (layer.baseUrl.match(url_matcher) === null) {
                localLayers.push(
                    new WarningMessage('url_external_layer_no_scheme_warning', {
                        layer: `${layer.type}|${layer.baseUrl}`,
                    })
                )
            }
        })
    const valid = faultyLayers.length < parsed.length
    if (!valid) {
        return getDefaultValidationResponse(query, valid, this.urlParamName)
    }
    let errors: ErrorMessage[] | undefined
    let warnings: WarningMessage[] | undefined
    if (faultyLayers.length > 0) {
        errors = faultyLayers
    }
    if (localLayers.length > 0) {
        warnings = localLayers
    }
    return {
        valid,
        errors,
        warnings,
    }
}

const layersParam = new UrlParamConfig<Layer[], string>({
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
        'updateLayer',
    ],
    setValuesInStore: dispatchLayersFromUrlIntoStore,
    extractValueFromStore: generateLayerUrlParamFromStoreValues,
    keepInUrlWhenDefault: true,
    valueType: String,
    validateUrlInput: validateUrlInput,
})
export default layersParam
