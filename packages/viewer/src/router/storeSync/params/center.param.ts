import type { SingleCoordinate } from '@swissgeo/coordinates'
import type { RouteLocationNormalizedGeneric } from 'vue-router'

import UrlParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/router/storeSync/UrlParamConfig.class'
import { getDefaultValidationResponse } from '@/router/storeSync/validation'
import useCesiumStore from '@/store/modules/cesium'
import usePositionStore from '@/store/modules/position'

export function readCenterFromUrlParam(urlParamValue?: string): SingleCoordinate | undefined {
    if (urlParamValue) {
        const centerValues = urlParamValue.split(',').map((value) => parseFloat(value))
        if (centerValues.length === 2) {
            return centerValues as SingleCoordinate
        }
    }
    return
}
function setValuesInStore(to: RouteLocationNormalizedGeneric, urlParamValue?: string) {
    const center = readCenterFromUrlParam(urlParamValue)

    // Quick explanation here: we use the 'center' parameter to center when
    // - there is no swisssearch parameter (as it takes priority) or
    // - there is a swisssearch parameter and a crosshair (it happens when we share positions)
    if (center && (!to.query.swisssearch || to.query.crosshair)) {
        usePositionStore().setCenter(center, STORE_DISPATCHER_ROUTER_PLUGIN)
    }
}

function extractValueFromStore(): string | undefined {
    const positionStore = usePositionStore()
    const cesiumStore = useCesiumStore()

    if (positionStore.center && !cesiumStore.active) {
        return positionStore.center
            .map((val: number) => positionStore.projection.roundCoordinateValue(val))
            .join(',')
    }
    return
}

function validateUrlInput(queryValue?: string) {
    if (queryValue) {
        const center = queryValue.split(',').map((value) => parseFloat(value))
        return getDefaultValidationResponse(
            queryValue,
            center.length === 2 && usePositionStore().projection.isInBounds(center[0]!, center[1]!),
            'center'
        )
    }
    return getDefaultValidationResponse(queryValue, false, 'center')
}

const centerParamConfig = new UrlParamConfig<string>({
    urlParamName: 'center',
    actionsToWatch: ['setCenter'],
    setValuesInStore,
    extractValueFromStore,
    keepInUrlWhenDefault: false,
    valueType: String,
    validateUrlInput,
})

export default centerParamConfig
