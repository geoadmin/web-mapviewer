import type { RouteLocationNormalizedGeneric } from 'vue-router'

import { isNumber } from 'lodash'

import { getStandardValidationResponse } from '@/api/errorQueues.api'
import UrlParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/router/storeSync/UrlParamConfig.class'
import { PositionStoreActions } from '@/store/actions'
import useCesiumStore from '@/store/modules/cesium.store'
import usePositionStore, { type CameraPosition } from '@/store/modules/position.store'

/**
 * Reads the camera position from the single URL param. Returns null if the camera position is not
 * defined or not complete
 */
export function readCameraFromUrlParam(urlParamValue?: string): CameraPosition | undefined {
    if (urlParamValue) {
        const cameraValues = urlParamValue
            .split(',')
            // parsing to number all values (default to 0 if the value is empty)
            .map((value) => (value === '' ? 0 : Number(value)))
        // the split must have 6 components (x, y, z, pitch, heading and roll)
        if (cameraValues.length === 6) {
            return {
                x: cameraValues[0] ?? 0,
                y: cameraValues[1] ?? 0,
                z: cameraValues[2] ?? 0,
                pitch: cameraValues[3] ?? 0,
                heading: cameraValues[4] ?? 0,
                roll: cameraValues[5] ?? 0,
            }
        }
    }
    return
}

function dispatchCameraFromUrlIntoStore(_: RouteLocationNormalizedGeneric, urlParamValue?: string) {
    const camera = readCameraFromUrlParam(urlParamValue)
    if (camera) {
        const positionStore = usePositionStore()
        positionStore.setCameraPosition(camera, STORE_DISPATCHER_ROUTER_PLUGIN)
    }
}

function generateCameraUrlParamFromStoreValues(): string | undefined {
    const cesiumStore = useCesiumStore()
    const positionStore = usePositionStore()
    if (cesiumStore.active && positionStore.camera) {
        const { x, y, z, pitch, heading, roll } = positionStore.camera
        const valuesAsString = [x, y, z, pitch, heading, roll].map((value) =>
            value === 0 ? '' : `${value}`
        )
        return valuesAsString.join(',')
    }
    return
}

/**
 * Definition of a set of URL params to store the position camera for the 3D viewer
 *
 * It will generate a unique camera URL param that will be a concat of all relevant camera values
 * (x,y,z,heading,pitch,roll), this param will only be added to the URL when 3D is active
 *
 * This param parsing is based on the value of the 3D flag in the store, and not the one in the URL.
 */
const cameraParam = new UrlParamConfig<string>({
    urlParamName: 'camera',
    actionsToWatch: [PositionStoreActions.SetCameraPosition],
    setValuesInStore: dispatchCameraFromUrlIntoStore,
    extractValueFromStore: generateCameraUrlParamFromStoreValues,
    keepInUrlWhenDefault: false,
    valueType: String,
    validateUrlInput: (queryValue?: string) =>
        getStandardValidationResponse(
            queryValue,
            !!queryValue &&
                queryValue.split(',').length === 6 &&
                queryValue.split(',').every((value) => value === '' || !isNumber(value)),
            'camera'
        ),
})

export default cameraParam
