import type { GeoAdminGeoJSONLayer } from '@swissgeo/layers'

import log, { LogPreDefinedColor } from '@swissgeo/log'
import axios from 'axios'

import type { ActionDispatcher } from '@/store/types'

import useLayersStore from '@/store/modules/layers'
import useUIStore from '@/store/modules/ui'

const LOADING_BAR_AUTO_RELOAD_REQUESTER = 'auto-load-geojson-style'
const intervalsByLayerId: Record<string, ReturnType<typeof setInterval>> = {}

export function launchGeoJsonAutoReload(
    geoJsonLayer: GeoAdminGeoJSONLayer,
    dispatcher: ActionDispatcher
): void {
    if (!geoJsonLayer.updateDelay) {
        return
    }
    // clearing any pre-existing interval for this layer
    if (intervalsByLayerId[geoJsonLayer.id]) {
        clearInterval(intervalsByLayerId[geoJsonLayer.id])
    }
    log.debug({
        title: 'GeoJSON auto-reload',
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

        uiStore.setLoadingBarRequester(LOADING_BAR_AUTO_RELOAD_REQUESTER, dispatcher)
        axios
            .get<string>(geoJsonLayer.geoJsonUrl)
            .then((response) => {
                const parsedGeoJsonData = typeof response.data === 'string'
                    ? JSON.parse(response.data)
                    : response.data
                layersStore.updateLayer<GeoAdminGeoJSONLayer>(
                    geoJsonLayer.id,
                    {
                        geoJsonData: parsedGeoJsonData,
                    },
                    dispatcher
                )
                log.debug({
                    title: 'GeoJSON auto-reload',
                    titleColor: LogPreDefinedColor.Indigo,
                    messages: [
                        `Data reloaded according to updateDelay for layer ${geoJsonLayer.id}`,
                    ],
                })
            })
            .catch((error) => {
                log.error({
                    title: 'GeoJSON auto-reload',
                    titleColor: LogPreDefinedColor.Indigo,
                    messages: [
                        `Error while reloading GeoJSON data for layer ${geoJsonLayer.id}`,
                        error,
                    ],
                })
            })
            .finally(() => {
                uiStore.clearLoadingBarRequester(LOADING_BAR_AUTO_RELOAD_REQUESTER, dispatcher)
            })
    }, geoJsonLayer.updateDelay)
}

export function clearAutoReload(layer: GeoAdminGeoJSONLayer | string): void {
    const layerId: string = typeof layer === 'string' ? layer : layer.id
    if (intervalsByLayerId[layerId]) {
        log.debug({
            title: 'GeoJSON auto-reload',
            titleColor: LogPreDefinedColor.Indigo,
            messages: [
                `Removing auto-reload of data for layer as it was removed from the map`,
                layer,
            ],
        })
        clearInterval(intervalsByLayerId[layerId])
        delete intervalsByLayerId[layerId]
    }
}
