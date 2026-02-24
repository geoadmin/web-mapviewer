import type { RouteLocationNormalizedGeneric } from 'vue-router'

import useCesiumStore from '@/store/modules/cesium'
import usePositionStore from '@/store/modules/position'
import UrlParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/store/plugins/storeSync/UrlParamConfig.class'
import { getDefaultValidationResponse } from '@/store/plugins/storeSync/validation'

function dispatchZoomFromUrlIntoStore(_: RouteLocationNormalizedGeneric, urlParamValue?: number) {
    if (urlParamValue) {
        usePositionStore().setZoom(urlParamValue, STORE_DISPATCHER_ROUTER_PLUGIN)
    }
}

function generateZoomUrlParamFromStoreValues(): number | undefined {
    if (useCesiumStore().active) {
        return
    }
    return usePositionStore().zoom
}

/** Describe the zoom level of the map in the URL. */
const zoomParamConfig = new UrlParamConfig<number>({
    urlParamName: 'z',
    actionsToWatch: ['setZoom', 'increaseZoom', 'decreaseZoom'],
    setValuesInStore: dispatchZoomFromUrlIntoStore,
    extractValueFromStore: generateZoomUrlParamFromStoreValues,
    keepInUrlWhenDefault: true,
    valueType: Number,
    validateUrlInput: (queryValue?: number) =>
        getDefaultValidationResponse(
            queryValue,
            !!queryValue && !isNaN(queryValue) && queryValue >= 0,
            'z'
        ),
})
export default zoomParamConfig
