import type {
    GeoAdminGeoJSONLayer,
    GeoAdminGeoJSONStyleRange,
    GeoAdminGeoJSONStyleUnique,
    Layer,
} from '@swissgeo/layers'
import type { PiniaPlugin } from 'pinia'

import { LayerType } from '@swissgeo/layers'
import { layerUtils } from '@swissgeo/layers/utils'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import { ErrorMessage } from '@swissgeo/log/Message'
import axios from 'axios'

import type { ActionDispatcher } from '@/store/types'

import { LayerStoreActions } from '@/store/actions'
import useLayersStore from '@/store/modules/layers.store'
import useUIStore from '@/store/modules/ui.store'
import { isEnumValue } from '@/utils/utils'

const dispatcher: ActionDispatcher = { name: 'load-geojson-style-and-data.plugin' }

const intervalsByLayerId: Record<string, NodeJS.Timeout> = {}

interface LoadFunctionResponse<ResponseType> {
    response: Promise<ResponseType>
    controller: AbortController
}

function load<ResponseType>(url: string): LoadFunctionResponse<ResponseType> {
    const controller = new AbortController()
    try {
        return { response: axios.get(url, { signal: controller.signal }), controller }
    } catch (error) {
        log.error({
            title: 'Load GeoJSON style and data',
            titleColor: LogPreDefinedColor.Indigo,
            messages: [`Error while loading URL ${url}`, error],
        })
        throw error
    }
}

function autoReloadData(geoJsonLayer: GeoAdminGeoJSONLayer): void {
    if (!geoJsonLayer.updateDelay) {
        return
    }
    // clearing any pre-existing interval for this layer
    if (intervalsByLayerId[geoJsonLayer.id]) {
        clearInterval(intervalsByLayerId[geoJsonLayer.id])
    }
    log.debug({
        title: 'Load GeoJSON style and data',
        titleColor: LogPreDefinedColor.Indigo,
        messages: [
            `Adding auto-reload of data for layer ${geoJsonLayer.id} according to its updateDelay`,
            geoJsonLayer,
        ],
    })
    // creating the new interval to reload this layer's data
    intervalsByLayerId[geoJsonLayer.id] = setInterval(() => {
        const layersStore = useLayersStore()
        const uiStore = useUIStore()

        const requester = 'auto-load-geojson-style'
        uiStore.setLoadingBarRequester(requester, dispatcher)
        load<string>(geoJsonLayer.geoJsonUrl)
            .response.then((data) => {
                layersStore.updateLayer<GeoAdminGeoJSONLayer>(
                    {
                        layerId: geoJsonLayer.id,
                        values: {
                            geoJsonData: data,
                        },
                    },
                    dispatcher
                )
                uiStore.clearLoadingBarRequester(requester, dispatcher)
                log.debug({
                    title: 'Load GeoJSON style and data',
                    titleColor: LogPreDefinedColor.Indigo,
                    messages: [
                        `Data reloaded according to updateDelay for layer ${geoJsonLayer.id}`,
                    ],
                })
            })
            .catch((error) => {
                log.error({
                    title: 'Load GeoJSON style and data',
                    titleColor: LogPreDefinedColor.Indigo,
                    messages: [
                        `Error while reloading GeoJSON data for layer ${geoJsonLayer.id}`,
                        error,
                    ],
                })
                uiStore.clearLoadingBarRequester(requester, dispatcher)
            })
    }, geoJsonLayer.updateDelay)
}

function clearAutoReload(layerId: string): void {
    log.debug(`Removing auto-reload of data for layer ${layerId} as it was removed from the map`)
    clearInterval(intervalsByLayerId[layerId])
    delete intervalsByLayerId[layerId]
}

interface LoadDataAndStyleResponse {
    /** Abort controllers for both the style and the data requests */
    controllers: AbortController[]
    pendingUpdatedLayer: Promise<GeoAdminGeoJSONLayer>
}

function loadDataAndStyle(geoJsonLayer: GeoAdminGeoJSONLayer): LoadDataAndStyleResponse {
    const layersStore = useLayersStore()

    log.debug({
        title: 'Load GeoJSON style and data',
        titleColor: LogPreDefinedColor.Indigo,
        messages: [`Loading data/style for added GeoJSON layer`, geoJsonLayer],
    })

    const style = load<GeoAdminGeoJSONStyleUnique | GeoAdminGeoJSONStyleRange>(
        geoJsonLayer.styleUrl
    )
    const data = load<string>(geoJsonLayer.geoJsonUrl)

    return {
        controllers: [style.controller, data.controller],
        pendingUpdatedLayer: Promise.all([style.response, data.response])
            .then(([style, data]) => {
                const updatedLayer = layerUtils.cloneLayer(geoJsonLayer)
                updatedLayer.geoJsonData = data
                updatedLayer.geoJsonStyle = style
                updatedLayer.isLoading = false
                return updatedLayer
            })
            .catch((error) => {
                log.error({
                    title: 'Load GeoJSON style and data',
                    titleColor: LogPreDefinedColor.Indigo,
                    messages: [
                        `Error while fetching GeoJSON data/style for layer ${geoJsonLayer?.id}`,
                        error,
                    ],
                })
                const clone = layerUtils.cloneLayer(geoJsonLayer)
                clone.isLoading = false
                layersStore.addLayerError(
                    {
                        layerId: geoJsonLayer.id,
                        error: new ErrorMessage('loading_error_network_failure'),
                    },
                    dispatcher
                )
                return clone
            }),
    }
}

interface PendingPreviewLayerRequest {
    controllers: AbortController[]
    layerId: string
}

let pendingPreviewLayer: PendingPreviewLayerRequest | undefined = undefined

async function loadAndUpdatePreviewLayer(layer: GeoAdminGeoJSONLayer): Promise<void> {
    const uiStore = useUIStore()
    const layersStore = useLayersStore()

    cancelLoadPreviewLayer()

    log.debug({
        title: 'Load GeoJSON style and data',
        titleColor: LogPreDefinedColor.Indigo,
        messages: [`Loading geojson data for preview layer ${layer.id}`],
    })

    const requester = 'load-preview-geojson-style-and-data'
    uiStore.setLoadingBarRequester(requester, dispatcher)

    const { pendingUpdatedLayer, controllers } = loadDataAndStyle(layer)
    pendingPreviewLayer = { controllers, layerId: layer.id }

    const updatedLayer = await pendingUpdatedLayer
    uiStore.clearLoadingBarRequester(requester, dispatcher)

    // Before updating the preview layer, we need to be sure that it has not been cleared in the meantime
    if (layersStore.previewLayer) {
        log.debug({
            title: 'Load GeoJSON style and data',
            titleColor: LogPreDefinedColor.Indigo,
            messages: [`Updating geojson data for preview layer ${layer.id}`],
        })
        layersStore.setPreviewLayer(updatedLayer, dispatcher)
    }
}

function cancelLoadPreviewLayer(): void {
    if (pendingPreviewLayer) {
        log.debug({
            title: 'Load GeoJSON style and data',
            titleColor: LogPreDefinedColor.Indigo,
            messages: [
                `Abort pending loading of preview geojson layer ${pendingPreviewLayer.layerId}`,
            ],
        })
        pendingPreviewLayer.controllers.map((controller) => controller.abort())
        pendingPreviewLayer = undefined
    }
}

async function addLayersSubscriber(layers: Layer[]): Promise<void> {
    const uiStore = useUIStore()
    const layersStore = useLayersStore()

    const geoJsonLayers = layers
        .filter((layer) => layer.type === LayerType.GEOJSON)
        // filtering out multiple active layer entries for the same GeoJSON data
        // (only one request to get the data is necessary for all entries)
        .filter((geoJsonLayer, index, self) => {
            const _layer = self.find((layer) => layer.id === geoJsonLayer.id)

            if (!_layer) {
                return false
            }

            // checking that the index of the first layer matching our ID is the same index as the layer
            // we are currently looping through, filtering it out otherwise (it's a duplicate)
            return self.indexOf(_layer) === index
        }) as GeoAdminGeoJSONLayer[] // for the rest we can be sure this is geojson

    const geoJsonLayersLoading = geoJsonLayers.filter((layer) => layer.isLoading)
    if (geoJsonLayersLoading.length > 0) {
        const requester = 'load-geojson-style-and-data'

        uiStore.setLoadingBarRequester(requester, dispatcher)

        const updatedLayers = await Promise.all(
            geoJsonLayersLoading.map((layer) => loadDataAndStyle(layer).pendingUpdatedLayer)
        )
        if (updatedLayers.length > 0) {
            layersStore.updateLayers(updatedLayers, dispatcher)
        }

        uiStore.clearLoadingBarRequester(requester, dispatcher)
    }

    // after the initial load is done,
    // going through all layers that have an update delay and launching the routine to reload their data
    geoJsonLayers
        .filter((layer) => layer.updateDelay || 0 > 0)
        .forEach((layer) => {
            log.debug('starting auto-reload of data for layer', layer)
            autoReloadData(layer)
        })
}

/**
 * Load GeoJSON data and style whenever a GeoJSON layer is added (or does nothing if the layer was
 * already processed/loaded)
 */
const loadGeojsonStyleAndDataPlugin: PiniaPlugin = (): void => {
    const layersStore = useLayersStore()

    layersStore.$onAction(({ name, args }) => {
        if (isEnumValue<LayerStoreActions>(LayerStoreActions.AddLayer, name)) {
            const [payload] = args as Parameters<typeof layersStore.addLayer>
            if (payload.layer) {
                addLayersSubscriber([payload.layer]).catch((error) => {
                    log.error({ messages: [error] })
                })
            }
        } else if (isEnumValue<LayerStoreActions>(LayerStoreActions.SetLayers, name)) {
            const [layers] = args as Parameters<typeof layersStore.setLayers>
            const nonStringLayers = layers.filter((layer) => !(typeof layer === 'string'))
            addLayersSubscriber(nonStringLayers).catch((error) => {
                log.error({ messages: [error] })
            })
        } else if (isEnumValue<LayerStoreActions>(LayerStoreActions.SetPreviewLayer, name)) {
            const [previewLayer] = args as Parameters<typeof layersStore.setPreviewLayer>

            if (typeof previewLayer === 'string') {
                const matchingLayers: Layer[] = layersStore.getLayersById(previewLayer)
                matchingLayers
                    .filter(
                        (layer) =>
                            layer.type === LayerType.GEOJSON &&
                            (layer as GeoAdminGeoJSONLayer).isLoading
                    )
                    .forEach((layer) => {
                        loadAndUpdatePreviewLayer(layer as GeoAdminGeoJSONLayer).catch((error) => {
                            log.error({
                                title: 'Load Update preview layer',
                                titleColor: LogPreDefinedColor.Indigo,
                                messages: [`Error while loading preview layer ${layer.id}`, error],
                            })
                        })
                    })
            } else if (previewLayer.type === LayerType.GEOJSON) {
                loadAndUpdatePreviewLayer(previewLayer as GeoAdminGeoJSONLayer).catch((error) => {
                    log.error({
                        title: 'Load Update preview layer',
                        titleColor: LogPreDefinedColor.Indigo,
                        messages: [`Error while loading preview layer ${previewLayer.id}`, error],
                    })
                })
            }
        } else if (isEnumValue<LayerStoreActions>(LayerStoreActions.ClearPreviewLayer, name)) {
            cancelLoadPreviewLayer()
        } else if (isEnumValue<LayerStoreActions>(LayerStoreActions.RemoveLayer, name)) {
            const [payload] = args as Parameters<typeof layersStore.removeLayer>
            if (payload.layerId && intervalsByLayerId[payload.layerId]) {
                // when a layer is removed, if a matching interval is found, we clear it
                clearAutoReload(payload.layerId)
            } else {
                // As we come after the work has been done,
                // we cannot get the layer ID removed from the store from the mutation's payload.
                // So we instead go through all intervals, and clear any that has no matching layer in the active layers
                Object.keys(intervalsByLayerId)
                    .filter(
                        (layerId) => !layersStore.activeLayers.some((layer) => layer.id === layerId)
                    )
                    .forEach((layerId) => clearAutoReload(layerId))
            }
        }
    })
}

export default loadGeojsonStyleAndDataPlugin
