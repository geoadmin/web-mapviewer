import AbstractParamConfig from '@/router/storeSync/abstractParamConfig.class'

function readValueFromObjectOrReturnNull(object, paramName, type) {
    if (object && paramName in object) {
        return type(object[paramName])
    }
    return null
}

/**
 * @param query
 * @returns {CameraPosition | null}
 */
function parseCameraFromQuery(query) {
    const camera = readValueFromObjectOrReturnNull(query, 'camera', String)
    if (camera) {
        let cameraValues = camera.split(',')
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
export default class CameraParamConfig extends AbstractParamConfig {
    constructor() {
        super(
            'camera',
            'setCameraPosition',
            () => {},
            () => {},
            false,
            String
        )
    }

    /**
     * Reads the camera position from the single URL param
     *
     * @param query
     * @returns {CameraPosition | null}
     * @override
     */
    readValueFromQuery(query) {
        return parseCameraFromQuery(query)
    }

    /**
     * Adds the camera URL param if 3D is active, or removes the camera URL param when not active
     *
     * @param query
     * @param store
     * @override
     */
    populateQueryWithStoreValue(query, store) {
        if (store.state.ui.showIn3d) {
            const { x, y, z, pitch, heading, roll } = store.state.position.camera
            const valuesAsString = [x, y, z, pitch, heading, roll].map((value) =>
                value === 0 ? '' : `${value}`
            )
            query['camera'] = valuesAsString.join(',')
        } else {
            delete query['camera']
        }
    }

    /**
     * Dispatches to the store the camera position from the URL, if 3D is active
     *
     * @param {Vuex.Store} store
     * @param query
     * @returns {Promise<Awaited[]>}
     * @override
     */
    populateStoreWithQueryValue(store, query) {
        const promisesSetValuesInStore = []
        if (store.state.ui.showIn3d) {
            const cameraInQuery = parseCameraFromQuery(query)
            if (cameraInQuery) {
                promisesSetValuesInStore.push(store.dispatch('setCameraPosition', cameraInQuery))
            }
        }
        return Promise.all(promisesSetValuesInStore)
    }

    /**
     * Checks if the camera in the URL is different from the one in the store, this check happens
     * only when 3D is active
     *
     * @param query
     * @param store
     * @returns {boolean}
     * @override
     */
    valuesAreDifferentBetweenQueryAndStore(query, store) {
        if (store.state.ui.showIn3d) {
            const queryCamera = parseCameraFromQuery(query)
            if (!queryCamera) {
                return true
            }
            const camera = store.state.position.camera
            let isEqual = true
            Object.entries(camera).forEach(([key, value]) => {
                isEqual &= value === queryCamera[key]
            })
            return !isEqual
        }
    }
}
