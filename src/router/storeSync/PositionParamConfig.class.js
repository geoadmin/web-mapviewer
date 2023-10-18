import AbstractParamConfig from '@/router/storeSync/abstractParamConfig.class'
import { round } from '@/utils/numberUtils'

export function readCenterFromUrlParam(urlParamValue) {
    if (urlParamValue) {
        let centerValues = urlParamValue.split(',')
        if (centerValues.length === 2) {
            return centerValues.map((value) => parseFloat(value))
        }
    }
    return null
}

function dispatchCenterFromUrlIntoStore(store, urlParamValue) {
    const promisesForAllDispatch = []
    const center = readCenterFromUrlParam(urlParamValue)
    if (center) {
        promisesForAllDispatch.push(store.dispatch('setCenter', center))
    }
    return Promise.all(promisesForAllDispatch)
}

function generateCenterUrlParamFromStoreValues(store) {
    if (store.state.position.center) {
        return store.state.position.center
            .map((val) => round(val, store.state.position.projection.acceptableDecimalPoints))
            .join(',')
    }
    return null
}

/**
 * Describe the position (center) of the map in the URL. It will make sure that the URL values are read as floating numbers.
 */
export default class PositionParamConfig extends AbstractParamConfig {
    constructor() {
        super(
            'center',
            'setCenter',
            dispatchCenterFromUrlIntoStore,
            generateCenterUrlParamFromStoreValues,
            true,
            String
        )
    }
}
