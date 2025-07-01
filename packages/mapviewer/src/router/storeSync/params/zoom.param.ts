import type { RouteLocationNormalizedGeneric } from 'vue-router'

import UrlParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/router/storeSync/UrlParamConfig.class'
import { getDefaultValidationResponse } from '@/router/storeSync/validation'
import useCesiumStore from '@/store/modules/cesium.store'
import usePositionStore from '@/store/modules/position.store'

export function readZoomFromUrlParam(urlParamValue?: string): number | undefined {
    if (urlParamValue) {
        return parseFloat(urlParamValue)
    }
    return
}

function dispatchZoomFromUrlIntoStore(_: RouteLocationNormalizedGeneric, urlParamValue?: string) {
    const zoom = readZoomFromUrlParam(urlParamValue)
    if (zoom) {
        const positionStore = usePositionStore()
        positionStore.setZoom(zoom, STORE_DISPATCHER_ROUTER_PLUGIN)
    }
}

function generateZoomUrlParamFromStoreValues(): number | undefined {
    const cesiumStore = useCesiumStore()
    if (cesiumStore.active) {
        return
    }
    const positionStore = usePositionStore()
    return positionStore.zoom
}

/** Describe the zoom level of the map in the URL. */
const zoomParamConfig = new UrlParamConfig<number, number>({
    urlParamName: 'z',
    mutationsToWatch: ['setZoom'],
    setValuesInStore: dispatchZoomFromUrlIntoStore,
    extractValueFromStore: generateZoomUrlParamFromStoreValues,
    keepInUrlWhenDefault: true,
    valueType: Number,
    validateUrlInput: (query) =>
        getDefaultValidationResponse(
            query,
            query && !isNaN(query) && Number(query) >= 0,
            this.urlParamName
        ),
})
export default zoomParamConfig
