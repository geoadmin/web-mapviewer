import AbstractParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/router/storeSync/abstractParamConfig.class'

export function readZoomFromUrlParam(urlParamValue) {
    if (urlParamValue) {
        return parseFloat(urlParamValue)
    }
    return null
}

function dispatchZoomFromUrlIntoStore(to, store, urlParamValue) {
    const promisesForAllDispatch = []
    const zoom = readZoomFromUrlParam(urlParamValue)
    if (zoom) {
        promisesForAllDispatch.push(
            store.dispatch('setZoom', {
                zoom,
                dispatcher: STORE_DISPATCHER_ROUTER_PLUGIN,
            })
        )
    }
    return Promise.all(promisesForAllDispatch)
}

function generateZoomUrlParamFromStoreValues(store) {
    if (store.state.cesium.active) {
        return null
    }
    return store.state.position.zoom
}

/** Describe the zoom level of the map in the URL. */
export default class ZoomParamConfig extends AbstractParamConfig {
    constructor() {
        super({
            urlParamName: 'z',
            mutationsToWatch: ['setZoom'],
            setValuesInStore: dispatchZoomFromUrlIntoStore,
            extractValueFromStore: generateZoomUrlParamFromStoreValues,
            keepInUrlWhenDefault: true,
            valueType: Number,
            acceptedValues: (store, query) => query && !isNaN(query) && Number(query) >= 0,
        })
    }
}
