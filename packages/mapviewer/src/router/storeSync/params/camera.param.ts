import type { RouteLocationNormalizedGeneric } from 'vue-router'

import UrlParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/router/storeSync/UrlParamConfig.class'
import { type CameraPosition, usePositionStore } from '@/store/modules/position.store'

/**
 * Reads the camera position from the single URL param. Returns null if the camera position is not
 * defined or not complete
 */
export function readCameraFromUrlParam(urlParamValue?: string): CameraPosition | undefined {
    if (urlParamValue) {
        let cameraValues = urlParamValue.split(',')
        // the split must have 6 components (x, y, z, pitch, heading and roll)
        if (cameraValues.length === 6) {
            // parsing to number all values (default to 0 if the value is empty)
            cameraValues = cameraValues.map((value) => (value === '' ? 0 : Number(value)))
            const [x, y, z, pitch, heading, roll] = cameraValues
            return {
                x,
                y,
                z,
                pitch,
                heading,
                roll,
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

function generateCameraUrlParamFromStoreValues() {
    if (store.state.cesium.active && store.state.position.camera !== null) {
        const { x, y, z, pitch, heading, roll } = store.state.position.camera
        const valuesAsString = [x, y, z, pitch, heading, roll].map((value) =>
            value === 0 ? '' : `${value}`
        )
        return valuesAsString.join(',')
    }
    return null
}

/**
 * Definition of a set of URL params to store the position camera for the 3D viewer
 *
 * It will generate a unique camera URL param that will be a concat of all relevant camera values
 * (x,y,z,heading,pitch,roll), this param will only be added to the URL when 3D is active
 *
 * This param parsing is based on the value of the 3D flag in the store, and not the one in the URL.
 */
const cameraParam = new UrlParamConfig<CameraPosition, string>({
    urlParamName: 'camera',
    mutationsToWatch: ['setCameraPosition'],
    setValuesInStore: dispatchCameraFromUrlIntoStore,
    extractValueFromStore: generateCameraUrlParamFromStoreValues,
    keepInUrlWhenDefault: false,
    valueType: String,
    validateUrlInput: (store, query) =>
        getDefaultValidationResponse(
            query,
            query &&
                query.split(',').length === 6 &&
                query.split(',').every((value) => value === '' || !isNaN(value)),
            this.urlParamName
        ),
})

export default cameraParam
