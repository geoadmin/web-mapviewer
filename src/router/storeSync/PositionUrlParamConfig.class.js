import AbstractParamConfig from '@/router/storeSync/abstractParamConfig.class'

function dispatchCameraPositionFromUrlIntoStore(store, urlParamValue) {
    const allValues = urlParamValue.split(',')
    const [x, y, z, yaw, pitch, roll] = allValues.map((value) =>
        value === '' ? 0 : parseFloat(value)
    )
    store.dispatch('setCameraPosition', {
        x,
        y,
        z,
        yaw,
        pitch,
        roll,
    })
}

function onlyShowIfNotZero(value) {
    if (value === 0) {
        return ''
    }
    return `${value}`
}

function generateCameraUrlParamFromStoreValues(store) {
    if (store.state.ui.showIn3d) {
        let { x, y, z, yaw, pitch, roll } = store.state.position.camera
        return [x, y, z, yaw, pitch, roll].map((value) => onlyShowIfNotZero(value)).join(',')
    }
    return null
}

function readValueFromObjectOrReturnNull(object, paramName, type) {
    if (object && paramName in object) {
        return type(object[paramName])
    }
    return null
}

function parseCameraFromQuery(query) {
    const camera = readValueFromObjectOrReturnNull(query, 'camera', String)
    if (camera) {
        let cameraValues = camera.split(',')
        // the split must have 6 components (x, y, z, pitch, yaw and roll)
        if (cameraValues.length === 6) {
            // parsing to number all values (default to 0 if the value is empty)
            cameraValues = cameraValues.map((value) => (value === '' ? 0 : Number(value)))
            const [x, y, z, pitch, yaw, roll] = cameraValues
            return {
                x,
                y,
                z,
                pitch,
                yaw,
                roll,
            }
        }
    }
    return null
}

function populateStoreWithParam(store, query, paramName, storeValue, dispatchTo) {
    if (query && query.hasOwnProperty(paramName)) {
        const value = Number(query[paramName])
        if (value !== storeValue) {
            return store.dispatch(dispatchTo, value)
        }
    }
}

/**
 * Definition of a set of URL params to store the position of the map in the URL. These params will
 * change depending on the mode of rendering of the map (2D or 3D)
 *
 * In 2D it will generate lon/lat/z params.
 *
 * In 3D it will generate a unique camera URL param that will be a concat of all relevant camera
 * values (x,y,z,yaw,pitch,roll)
 *
 * This param config class takes for granted that the store's flag showIn3d has been processed
 * before it is then called to do its job. Meaning that if the flag has changed in the URL, but the
 * store is out of sync, things will break.
 */
export default class PositionUrlParamConfig extends AbstractParamConfig {
    constructor() {
        super(
            'camera',
            'setCameraPosition,setCenter,setZoom,setShowIn3d',
            dispatchCameraPositionFromUrlIntoStore,
            generateCameraUrlParamFromStoreValues,
            false,
            String
        )
    }

    /**
     * Even though it is not used below in populate functions, this is required so that the
     * routerStoreSyncPlugin can work properly
     *
     * @returns {Object}
     */
    readValueFromQuery(query) {
        if (!query) {
            return undefined
        }
        const is3dActive = readValueFromObjectOrReturnNull(query, 'showIn3d', Boolean)
        if (is3dActive) {
            const camera = parseCameraFromQuery(query)
            if (camera) {
                return { camera }
            }
        } else {
            const lon = readValueFromObjectOrReturnNull(query, 'lon', Number)
            const lat = readValueFromObjectOrReturnNull(query, 'lat', Number)
            const z = readValueFromObjectOrReturnNull(query, 'z', Number)
            // using Object assign to filter any null value (if a value is null, its key won't be added to the resulting object)
            return Object.assign({}, lon && { lon }, lat && { lat }, z && { z })
        }
        return null
    }

    /**
     * Adds relevant param to the query depending on if 3D is active or not.
     *
     * Will also remove any param that is present but do not match to the state of the 3D flag
     *
     * @param {Object} query Simple Object that holds all URL parameters (key is the name of param
     *   in the URL, value is its value)
     * @param {Vuex.Store} store
     * @override
     */
    populateQueryWithStoreValue(query, store) {
        if (store.state.ui.showIn3d) {
            const { x, y, z, pitch, yaw, roll } = store.state.position.camera
            const valuesAsString = [x, y, z, pitch, yaw, roll].map((value) =>
                value === 0 ? '' : `${value}`
            )
            query['camera'] = valuesAsString.join(',')
            delete query['lon']
            delete query['lat']
            delete query['z']
        } else {
            query['lon'] = `${store.getters.centerEpsg4326[0]}`
            query['lat'] = `${store.getters.centerEpsg4326[1]}`
            query['z'] = `${store.state.position.zoom}`
            delete query['camera']
        }
    }

    /**
     * Dispatches to the store position values from the URL depending on the 3D flag value.
     *
     * If 3D is active, will dispatch the camera position
     *
     * If 3D is inactive, will dispatch longitude latitude and zoom
     *
     * @param store
     * @param query
     * @returns {Promise<Awaited[]>}
     * @override
     */
    populateStoreWithQueryValue(store, query) {
        const promisesSetValuesInStore = []
        if (store.state.ui.showIn3d) {
            const camera = parseCameraFromQuery(query)
            if (camera) {
                promisesSetValuesInStore.push(store.dispatch('setCameraPosition', camera))
            }
        } else {
            promisesSetValuesInStore.push(
                populateStoreWithParam(
                    store,
                    query,
                    'lon',
                    store.getters.centerEpsg4326[0],
                    'setLongitude'
                )
            )
            promisesSetValuesInStore.push(
                populateStoreWithParam(
                    store,
                    query,
                    'lat',
                    store.getters.centerEpsg4326[1],
                    'setLatitude'
                )
            )
            promisesSetValuesInStore.push(
                populateStoreWithParam(store, query, 'z', store.state.position.zoom, 'setZoom')
            )
        }
        return Promise.all(promisesSetValuesInStore)
    }

    /**
     * Checks if, depending on the 3D flag in the store, params for position in the URL are
     * different from what is present in the store.
     *
     * Will ignore differences in params that do not match the 3D flag in the store (e.g. if camera
     * is in the query, but 3D is inactive, it will be ignored from the query and not read)
     *
     * @param query
     * @param store
     * @returns {boolean}
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
        } else {
            const queryLon = readValueFromObjectOrReturnNull(query, 'lon', Number)
            const queryLat = readValueFromObjectOrReturnNull(query, 'lat', Number)
            const queryZoom = readValueFromObjectOrReturnNull(query, 'z', Number)
            return (
                queryLon !== store.getters.centerEpsg4326[0] ||
                queryLat !== store.getters.centerEpsg4326[1] ||
                queryZoom !== store.state.position.zoom
            )
        }
    }
}
