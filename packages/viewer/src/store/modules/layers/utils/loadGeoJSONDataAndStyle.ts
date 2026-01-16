import type {
    GeoAdminGeoJSONLayer,
    GeoAdminGeoJSONStyleRange,
    GeoAdminGeoJSONStyleUnique,
} from '@swissgeo/layers'

import { layerUtils } from '@swissgeo/layers/utils'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import { ErrorMessage } from '@swissgeo/log/Message'

import type { ActionDispatcher } from '@/store/types'

import useLayersStore from '@/store/modules/layers'
import { launchGeoJsonAutoReload } from '@/store/modules/layers/utils/autoReloadGeoJson'
import useUIStore from '@/store/modules/ui'
import { getWithAbortController } from '@/utils/axios'

const LOADING_BAR_REQUEST_NAME = 'load-geojson-style-and-data'

interface LoadGeoJsonDataAndStyleReturn {
    promise: Promise<void>
    abortController: AbortController
}

export default function loadGeoJsonDataAndStyle(
    geoJsonLayer: GeoAdminGeoJSONLayer,
    dispatcher: ActionDispatcher
): LoadGeoJsonDataAndStyleReturn {
    const layersStore = useLayersStore()
    const uiStore = useUIStore()

    uiStore.setLoadingBarRequester(LOADING_BAR_REQUEST_NAME, dispatcher)

    log.debug({
        title: 'Load GeoJSON style and data',
        titleColor: LogPreDefinedColor.Indigo,
        messages: [`Loading data/style for added GeoJSON layer`, geoJsonLayer],
    })

    const { pendingRequest: pendingDataRequest, controller } = getWithAbortController<string>(
        geoJsonLayer.geoJsonUrl
    )

    const { pendingRequest: pendingStyleRequest } = getWithAbortController<
        GeoAdminGeoJSONStyleUnique | GeoAdminGeoJSONStyleRange
    >(geoJsonLayer.styleUrl, controller)

    return {
        abortController: controller,
        promise: new Promise((resolve, reject) => {
            Promise.all([pendingDataRequest, pendingStyleRequest])
                .then(([dataResponse, styleResponse]) => {
                    const parsedGeoJsonData = typeof dataResponse.data === 'string'
                        ? JSON.parse(dataResponse.data)
                        : dataResponse.data
                    layersStore.updateLayer<GeoAdminGeoJSONLayer>(
                        geoJsonLayer.id,
                        {
                            geoJsonData: parsedGeoJsonData,
                            geoJsonStyle: styleResponse.data,
                            isLoading: false,
                        },
                        dispatcher
                    )

                    // after the initial load is done,
                    // checking if the layer has an update delay, launching the routine to reload its data if necessary
                    if (geoJsonLayer.updateDelay && geoJsonLayer.updateDelay > 0) {
                        log.debug({
                            title: 'Load GeoJSON style and data',
                            titleColor: LogPreDefinedColor.Indigo,
                            messages: ['starting auto-reload of data for layer', geoJsonLayer],
                        })
                        launchGeoJsonAutoReload(geoJsonLayer, dispatcher)
                    }
                    resolve()
                })
                .catch((error) => {
                    controller.abort(error)
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
                        geoJsonLayer.id,
                        new ErrorMessage('loading_error_network_failure'),
                        dispatcher
                    )
                    if (error instanceof Error) {
                        reject(error)
                    } else {
                        reject(new Error('Unknown error'))
                    }
                })
                .finally(() => {
                    uiStore.clearLoadingBarRequester(LOADING_BAR_REQUEST_NAME, dispatcher)
                })
        }),
    }
}
