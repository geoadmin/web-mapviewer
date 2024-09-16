import AbstractParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/router/storeSync/abstractParamConfig.class'

export function readCenterFromUrlParam(urlParamValue) {
    if (urlParamValue) {
        let centerValues = urlParamValue.split(',')
        if (centerValues.length === 2) {
            return centerValues.map((value) => parseFloat(value))
        }
    }
    return null
}

function dispatchCenterFromUrlIntoStore(to, store, urlParamValue) {
    const promisesForAllDispatch = []
    const center = readCenterFromUrlParam(urlParamValue)
    if (center) {
        promisesForAllDispatch.push(
            store.dispatch('setCenter', { center, dispatcher: STORE_DISPATCHER_ROUTER_PLUGIN })
        )
    }
    return Promise.all(promisesForAllDispatch)
}

function generateCenterUrlParamFromStoreValues(store) {
    if (store.state.position.center && !store.state.cesium.active) {
        return store.state.position.center
            .map((val) => store.state.position.projection.roundCoordinateValue(val))
            .join(',')
    }
    return null
}

function acceptedValues(store, query) {
    if (query) {
        let center = query.split(',')
        return (
            center.length === 2 &&
            store.state.position.projection.isInBounds(query.split(',')[0], query.split(',')[1])
        )
    }
    return false
}

/**
 * Describe the position (center) of the map in the URL. It will make sure that the URL values are
 * read as floating numbers.
 */
export default class PositionParamConfig extends AbstractParamConfig {
    constructor() {
        super({
            urlParamName: 'center',
            mutationsToWatch: ['setCenter'],
            setValuesInStore: dispatchCenterFromUrlIntoStore,
            extractValueFromStore: generateCenterUrlParamFromStoreValues,
            keepInUrlWhenDefault: true,
            valueType: String,
            acceptedValues: acceptedValues,
        })
    }
}
