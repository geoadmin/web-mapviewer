import AbstractParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/router/storeSync/abstractParamConfig.class'
import { round } from '@/utils/numberUtils'

function dispatchCrossHairFromUrlIntoStore(to, store, urlParamValue) {
    const promisesForAllDispatch = []

    if (typeof urlParamValue !== 'string') {
        promisesForAllDispatch.push(
            store.dispatch('setCrossHair', {
                crossHair: null,
                dispatcher: STORE_DISPATCHER_ROUTER_PLUGIN,
            })
        )
    }

    const parts = urlParamValue.split(',')
    if (parts.length === 1) {
        promisesForAllDispatch.push(
            store.dispatch('setCrossHair', {
                crossHair: urlParamValue,
                dispatcher: STORE_DISPATCHER_ROUTER_PLUGIN,
            })
        )
    } else if (parts.length === 3) {
        const crossHair = parts[0]
        const crossHairPosition = [parseFloat(parts[1]), parseFloat(parts[2])]
        promisesForAllDispatch.push(
            store.dispatch('setCrossHair', {
                crossHair,
                crossHairPosition,
                dispatcher: STORE_DISPATCHER_ROUTER_PLUGIN,
            })
        )
    }
    return Promise.all(promisesForAllDispatch)
}

function generateCrossHairUrlParamFromStoreValues(store) {
    if (store.state.position.crossHair) {
        let crossHairParamValue = store.state.position.crossHair
        const { center, crossHairPosition } = store.state.position
        if (
            crossHairPosition &&
            (center[0] !== crossHairPosition[0] || center[1] !== crossHairPosition[1])
        ) {
            crossHairParamValue += `,${crossHairPosition.map((val) => round(val, 2)).join(',')}`
        }
        return crossHairParamValue
    }
    return null
}

/**
 * Concat the crosshair type with its position, if the crosshair's position is not the same as the
 * current center of the map.
 *
 * This enables users to change the crosshair's type and position "on the fly" without reloading the
 * app
 */
export default class CrossHairParamConfig extends AbstractParamConfig {
    constructor() {
        super(
            'crosshair',
            'setCrossHair,setCrossHairPosition',
            dispatchCrossHairFromUrlIntoStore,
            generateCrossHairUrlParamFromStoreValues,
            false,
            String
        )
    }
}
