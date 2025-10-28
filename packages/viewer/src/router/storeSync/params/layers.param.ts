import type { RouteLocationNormalizedGeneric } from 'vue-router'

import { extentUtils } from '@swissgeo/coordinates'
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
} from '@swissgeo/layers'
import { layerUtils, timeConfigUtils } from '@swissgeo/layers/utils'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import { ErrorMessage, WarningMessage } from '@swissgeo/log/Message'
import * as vueRouter from 'vue-router'

import type { LayerFeature } from '@/api/features.api'

import getFeature from '@/api/features.api'
import {
    orderFeaturesByLayers,
    parseLayersParam,
    transformLayerIntoUrlString,
} from '@/router/storeSync/layersParamParser'
import UrlParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/router/storeSync/UrlParamConfig.class'
import {
    getDefaultValidationResponse,
    type ValidationResponse,
} from '@/router/storeSync/validation'
import { LayerStoreActions } from '@/store/actions'
import useDrawingStore from '@/store/modules/drawing'
import useFeaturesStore from '@/store/modules/features'
import useI18nStore from '@/store/modules/i18n'
import useLayersStore from '@/store/modules/layers'
import usePositionStore from '@/store/modules/position'
import useUIStore from '@/store/modules/ui'
import { getExtentOfGeometries } from '@/utils/geoJsonUtils'

function createWMTSLayerObject(parsedLayer: Partial<Layer>): ExternalWMTSLayer {
    const { year } = parsedLayer.customAttributes ?? {}

    return layerUtils.makeExternalWMTSLayer({
        type: LayerType.WMTS,
        id: parsedLayer.id,
        name: parsedLayer.id,
        opacity: parsedLayer.opacity,
        isVisible: parsedLayer.isVisible,
        baseUrl: parsedLayer.baseUrl,
        currentYear: typeof year === 'number' ? year : undefined,
    })
}

function createWMSLayerObject(parsedLayer: Partial<Layer>): ExternalWMSLayer {
    const { customAttributes } = parsedLayer
    const { year } = customAttributes ?? {}

    // here we assume that is a regular WMS layer, upon parsing of the WMS get capabilities
    // the layer might be updated to an external group of layers if needed.
    return layerUtils.makeExternalWMSLayer({
        id: parsedLayer.id,
        name: parsedLayer.id,
        opacity: parsedLayer.opacity ?? DEFAULT_OPACITY,
        isVisible: parsedLayer.isVisible,
        baseUrl: parsedLayer.baseUrl,
        currentYear: typeof year === 'number' ? year : undefined,
        customAttributes,
    })
}

function createKmlLayer(parsedLayer: Partial<Layer>, adminId: string | undefined): KMLLayer {
    return layerUtils.makeKMLLayer({
        kmlFileUrl: parsedLayer.baseUrl,
        isVisible: parsedLayer.isVisible,
        opacity: parsedLayer.opacity ?? DEFAULT_OPACITY,
        adminId: adminId,
        style: parsedLayer.customAttributes?.style,
    })
}

function createGPGXLayer(parsedLayer: Partial<Layer>): GPXLayer {
    return layerUtils.makeGPXLayer({
        gpxFileUrl: parsedLayer.baseUrl,
        isVisible: parsedLayer.isVisible,
        opacity: parsedLayer.opacity ?? DEFAULT_OPACITY,
    })
}

function createCloudOptimizedGeoTIFFLayer(parsedLayer: Partial<Layer>): CloudOptimizedGeoTIFFLayer {
    return layerUtils.makeCloudOptimizedGeoTIFFLayer({
        fileSource: parsedLayer.baseUrl,
        isVisible: parsedLayer.isVisible,
        opacity: parsedLayer.opacity ?? DEFAULT_OPACITY,
        isLoading: false,
    })
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
    const { year, updateDelay, features, adminId, ...customAttributes } =
        parsedLayer.customAttributes ?? {}

    const layersStore = useLayersStore()

    let layer: Layer | undefined

    if (currentLayer && (currentLayer.isExternal || currentLayer.type === LayerType.KML)) {
        // the layer is already present in the active layers, so simply update it instead of
        // replacing it. This avoids reloading the data of the layer (e.g. KML name, external
        // layer display name) when using the browser history navigation.
        layer = layerUtils.cloneLayer(currentLayer)
        layer.isVisible = parsedLayer.isVisible ?? false
        // external layer have a default opacity of 1.0
        layer.opacity = parsedLayer.opacity ?? DEFAULT_OPACITY

        if (adminId && layer.type === LayerType.KML) {
            ; (layer as KMLLayer).adminId = adminId
        }
    } else if (parsedLayer.type === LayerType.KML) {
        // format is KML|FILE_URL
        if (parsedLayer.baseUrl?.startsWith('http')) {
            layer = createKmlLayer(parsedLayer, adminId)
        } else {
            // If the url does not start with http, then it is a local file and we don't add it
            // to the layer list upon start as we cannot load it anymore.
        }
        // format is GPX|FILE_URL
    } else if (parsedLayer.type === LayerType.GPX) {
        if (parsedLayer.baseUrl?.startsWith('http')) {
            layer = createGPGXLayer(parsedLayer)
        } else {
            // we can't re-load GPX files loaded through a file import; this GPX file is ignored
        }
    } else if (parsedLayer.type === LayerType.COG) {
        // format is GEOTIFF|FILE_URL
        if (parsedLayer.baseUrl?.startsWith('http')) {
            layer = createCloudOptimizedGeoTIFFLayer(parsedLayer)
        }
        // format is WMTS|GET_CAPABILITIES_URL|LAYER_ID
    } else if (parsedLayer.type === LayerType.WMTS) {
        layer = createWMTSLayerObject(parsedLayer)
        // format is : WMS|BASE_URL|LAYER_ID
    } else if (parsedLayer.type === LayerType.WMS) {
        layer = createWMSLayerObject(parsedLayer)
    } else if (parsedLayer.id) {
        const matchingLayer = layersStore.getLayerConfigById(parsedLayer.id)
        // Finally, check if this is a Geoadmin layer
        if (matchingLayer) {
            layer = layerUtils.cloneLayer(matchingLayer)
            layer.isVisible = parsedLayer.isVisible ?? false
            if (parsedLayer.opacity !== undefined) {
                layer.opacity = parsedLayer.opacity
            }
            if (year !== undefined && layer.timeConfig) {
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
    if (layer && !layer.isExternal) {
        const internalLayer = layer as GeoAdminLayer

        if (internalLayer.type === LayerType.GEOJSON && updateDelay !== undefined) {
            ; (internalLayer as GeoAdminGeoJSONLayer).updateDelay = updateDelay
        }

        // only highlightable feature will output something, for the others a click coordinate is required
        // (and we don't have it if we are here, as we are dealing with pre-selected feature in the URL at app startup)
        if (internalLayer.isHighlightable && features !== undefined) {
            const i18nStore = useI18nStore()
            const positionStore = usePositionStore()
            const uiStore = useUIStore()
            features
                .toString()
                .split(':')
                .forEach((featureId) => {
                    featuresRequests.push(
                        getFeature(internalLayer, featureId, positionStore.projection, {
                            lang: i18nStore.lang,
                            screenWidth: uiStore.width,
                            screenHeight: uiStore.height,
                            mapExtent: extentUtils.flattenExtent(positionStore.extent),
                        })
                    )
                })
        }
    }

    if (!layer) {
        log.error({
            title: 'Layer URL param / createLayerObject',
            titleColor: LogPreDefinedColor.Sky,
            messages: [
                `Invalid layer ${parsedLayer.id} parsed from the URL, layer is not found in layer config and is not external`,
            ],
        })
    }

    return { layer, featuresRequests }
}

function dispatchLayersFromUrlIntoStore(
    to: RouteLocationNormalizedGeneric,
    urlParamValue?: string
): void {
    const parsedLayers = parseLayersParam(urlParamValue ?? '')
    const promisesForAllDispatch = []

    const drawingStore = useDrawingStore()
    const layersStore = useLayersStore()

    log.debug({
        title: 'Layers URL param / dispatchLayersFromUrlIntoStore',
        titleColor: LogPreDefinedColor.Sky,
        messages: [
            `Dispatch Layers from URL into store: ${urlParamValue}`,
            layersStore.activeLayers,
            parsedLayers,
        ],
    })
    const featuresRequests: Promise<LayerFeature>[] = []

    const layers = parsedLayers
        .map((parsedLayer, index) => {
            // First check if we already have the layer in the active layers
            const layerAtIndex = layersStore.getActiveLayerByIndex(index)
            const currentLayer = layerAtIndex?.id === parsedLayer.id ? layerAtIndex : undefined

            if (!currentLayer) {
                return
            }

            const { layer: layerObject, featuresRequests: layerFeatureRequests } =
                createLayerObject(parsedLayer, currentLayer)

            if (layerFeatureRequests) {
                featuresRequests.push(...layerFeatureRequests)
            }

            if (layerObject) {
                if (layerObject.type === LayerType.KML && (layerObject as KMLLayer).adminId) {
                    drawingStore.toggleDrawingOverlay(
                        {
                            show: true,
                        },
                        STORE_DISPATCHER_ROUTER_PLUGIN
                    )
                    drawingStore.setIsVisitWithAdminId(true, STORE_DISPATCHER_ROUTER_PLUGIN)
                }
                log.debug({
                    title: 'Layers URL param / dispatchLayersFromUrlIntoStore',
                    titleColor: LogPreDefinedColor.Sky,
                    messages: [`Add layer ${parsedLayer.id} to active layers`, layerObject],
                })
            }
            return layerObject
        })
        .filter((layer) => !!layer)

    layersStore.setLayers(layers, STORE_DISPATCHER_ROUTER_PLUGIN)

    if (featuresRequests.length > 0) {
        promisesForAllDispatch.push(getAndDispatchFeatures(to, featuresRequests))
    }

    Promise.all(promisesForAllDispatch).catch((error) => {
        log.error({
            title: 'Layers URL param / dispatchLayersFromUrlIntoStore',
            titleColor: LogPreDefinedColor.Sky,
            messages: [`Error while processing features in feature preselection.`, error],
        })
    })
}

async function getAndDispatchFeatures(
    to: vueRouter.RouteLocation,
    featuresPromise: Promise<LayerFeature>[]
): Promise<void> {
    const featuresStore = useFeaturesStore()
    const positionStore = usePositionStore()

    try {
        const responses = await Promise.allSettled(featuresPromise)
        const features = responses
            .filter((response) => response.status === 'fulfilled')
            .map((response) => response.value)
        if (features.length > 0) {
            featuresStore.setSelectedFeatures(features, STORE_DISPATCHER_ROUTER_PLUGIN)

            const extent = getExtentOfGeometries(
                features.map((feature) => feature.geometry).filter((geometry) => !!geometry)
            )
            if (!extent) {
                return
            }
            // If the zoom level has been specifically set to a level, we don't want to override that.
            // otherwise, we go to the zoom level which encompass all features
            const query = to.query
            if (!query.z) {
                positionStore.zoomToExtent(
                    extent,
                    {
                        maxZoom: positionStore.projection.get1_25000ZoomLevel(),
                    },
                    STORE_DISPATCHER_ROUTER_PLUGIN
                )
            } else {
                positionStore.setCenter(
                    extentUtils.getExtentCenter(extent),
                    STORE_DISPATCHER_ROUTER_PLUGIN
                )
            }
        }
    } catch (error) {
        log.error({
            title: 'Layers URL param / getAndDispatchFeatures',
            titleColor: LogPreDefinedColor.Sky,
            messages: [`Error while processing features in feature preselection.`, error],
        })
    }
}

function generateLayerUrlParamFromStoreValues(): string {
    const featuresStore = useFeaturesStore()
    const layersStore = useLayersStore()

    const featuresIds = orderFeaturesByLayers(featuresStore.selectedFeatures) as Record<
        string,
        string[]
    >

    return layersStore.activeLayers
        .map((layer: Layer) =>
            transformLayerIntoUrlString(
                layer,
                layersStore.config.find((config: Layer) => config.id === layer.id),
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
export function validateUrlInput(queryValue?: string): ValidationResponse {
    if (!queryValue || queryValue === '') {
        return {
            valid: true,
        }
    }
    const layersStore = useLayersStore()

    const parsed = parseLayersParam(queryValue)
    const url_matcher = /https?:\/\//
    const faultyLayers: ErrorMessage[] = []
    const localLayers: WarningMessage[] = []
    parsed
        .filter((layer) => layer.id && !layersStore.getLayerConfigById(layer.id))
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
        return getDefaultValidationResponse(queryValue, valid, 'layers')
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

const layersParam = new UrlParamConfig<string>({
    urlParamName: 'layers',
    actionsToWatch: [
        LayerStoreActions.ToggleLayerVisibility,
        LayerStoreActions.AddLayer,
        LayerStoreActions.RemoveLayer,
        LayerStoreActions.ClearLayers,
        LayerStoreActions.MoveActiveLayerToIndex,
        LayerStoreActions.SetLayerOpacity,
        LayerStoreActions.SetTimedLayerCurrentYear,
        LayerStoreActions.SetTimedLayerCurrentTimeEntry,
        LayerStoreActions.SetLayers,
        LayerStoreActions.UpdateLayer,
        'setSelectedFeatures',
    ],
    setValuesInStore: dispatchLayersFromUrlIntoStore,
    extractValueFromStore: generateLayerUrlParamFromStoreValues,
    keepInUrlWhenDefault: true,
    valueType: String,
    validateUrlInput: validateUrlInput,
})
export default layersParam
