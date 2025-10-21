import type { RouteLocationNormalizedGeneric } from 'vue-router'

import UrlParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/router/storeSync/UrlParamConfig.class'
import { getDefaultValidationResponse } from '@/router/storeSync/validation'
import { PositionStoreActions } from '@/store/actions'
import useCesiumStore from '@/store/modules/cesium'
import usePositionStore from '@/store/modules/position.store'

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
    actionsToWatch: [PositionStoreActions.SetZoom],
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
