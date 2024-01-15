import AbstractParamConfig from '@/router/storeSync/abstractParamConfig.class'

export function readZoomFromUrlParam(urlParamValue) {
    if (urlParamValue) {
        return parseFloat(urlParamValue)
    }
    return null
}

function dispatchZoomFromUrlIntoStore(store, urlParamValue) {
    const promisesForAllDispatch = []
    const zoom = readZoomFromUrlParam(urlParamValue)
    if (zoom) {
        promisesForAllDispatch.push(
            store.dispatch('setZoom', { zoom, source: 'URL param parsing' })
        )
    }
    return Promise.all(promisesForAllDispatch)
}

function generateZoomUrlParamFromStoreValues(store) {
    return store.state.position.zoom
}

/** Describe the zoom level of the map in the URL. */
export default class ZoomParamConfig extends AbstractParamConfig {
    constructor() {
        super(
            'z',
            'setZoom',
            dispatchZoomFromUrlIntoStore,
            generateZoomUrlParamFromStoreValues,
            true,
            Number
        )
    }
}
