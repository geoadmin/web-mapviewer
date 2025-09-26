import log, { LogPreDefinedColor } from '@swissgeo/log'
import { ErrorMessage } from '@swissgeo/log/Message'
import axios from 'axios'

import type {
    GeoAdminGeoJSONLayer,
    GeoAdminGeoJSONStyleUnique,
    GeoAdminGeoJSONStyleRange,
    Layer,
} from '@swissgeo/layers'
import { LayerType } from '@swissgeo/layers'
import { layerUtils } from '@swissgeo/layers/utils'
import type { ActionDispatcher } from '@/store/types'
import type { PiniaPlugin, PiniaPluginContext } from 'pinia'
import useLayersStore, { type AddLayerPayload } from '@/store/modules/layers.store.ts'
import useUIStore from '@/store/modules/ui.store.ts'

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
async function addLayersSubscriber(layers: Layer[]): void {
    const geoJsonLayers = layers
        .filter((layer) => layer.type === LayerType.GEOJSON)
        // filtering out multiple active layer entries for the same GeoJSON data
        // (only one request to get the data is necessary for all entries)
        .filter(
            (geoJsonLayer, index, self) =>
                // checking that the index of the first layer matching our ID is the same index as the layer
                // we are currently looping through, filtering it out otherwise (it's a duplicate)
                self.indexOf(self.find((layer) => layer.id === geoJsonLayer.id)) === index
        )

    const geoJsonLayersLoading = geoJsonLayers.filter((layer) => layer.isLoading)
    if (geoJsonLayersLoading.length > 0) {
        const requester = 'load-geojson-style-and-data'
        store.dispatch('setLoadingBarRequester', { requester, ...dispatcher })
        const updatedLayers = await Promise.all(
            geoJsonLayersLoading.map((layer) => loadDataAndStyle(layer).clone)
        )
        if (updatedLayers.length > 0) {
            store.dispatch('updateLayers', { layers: updatedLayers, ...dispatcher })
        }
        store.dispatch('clearLoadingBarRequester', { requester, ...dispatcher })
    }

    // after the initial load is done,
    // going through all layers that have an update delay and launching the routine to reload their data
    geoJsonLayers
        .filter((layer) => layer.updateDelay > 0)
        .forEach((layer) => {
            log.debug('starting auto-reload of data for layer', layer)
            autoReloadData(store, layer)
        })
}

/**
 * Load GeoJSON data and style whenever a GeoJSON layer is added (or does nothing if the layer was
 * already processed/loaded)
 */
const loadGeojsonStyleAndDataPlugin: PiniaPlugin = (context: PiniaPluginContext): void => {
    const { store } = context

    const layersStore = useLayersStore()

    store.$onAction(({ name, args }) => {
        if (name === 'addLayer') {
            const payload: AddLayerPayload = args[0]
            if (payload?.layer) {
                addLayersSubscriber([payload.layer])
            }
        } else if (name === 'setLayers') {
            const layers = args[0] as Layer[]
            addLayersSubscriber(layers)
        } else if (name === 'setPreviewLayer') {
            const previewLayer = args[0] as Layer | string
            if (typeof previewLayer === 'string') {
                const matchingLayers: Layer[] = layersStore.getLayersById(previewLayer)
                matchingLayers
                    .filter(
                        (layer) =>
                            layer.type === LayerType.GEOJSON &&
                            (layer as GeoAdminGeoJSONLayer).isLoading
                    )
                    .forEach((layer) => {
                        loadAndUpdatePreviewLayer(layer as GeoAdminGeoJSONLayer)
                    })
            }
            loadAndUpdatePreviewLayer(store, mutation.payload.layer)
        } else if (name === 'setPreviewLayer' && mutation.payload.layer === null) {
            cancelLoadPreviewLayer()
        } else if (name === 'removeLayerWithId' && intervalsByLayerId[mutation.payload.layerId]) {
            // when a layer is removed, if a matching interval is found, we clear it
            clearAutoReload(mutation.payload.layerId)
        } else if (name === 'removeLayerByIndex') {
            // As we come after the work has been done,
            // we cannot get the layer ID removed from the store from the mutation's payload.
            // So we instead go through all intervals, and clear any that has no matching layer in the active layers
            Object.keys(intervalsByLayerId)
                .filter(
                    (layerId) =>
                        !store.state.layers.activeLayers.some((layer) => layer.id === layerId)
                )
                .forEach((layerId) => clearAutoReload(layerId))
        }
    })
}

export default loadGeojsonStyleAndDataPlugin
