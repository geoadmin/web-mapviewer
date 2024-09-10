import AbstractParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/router/storeSync/abstractParamConfig.class'
import { CrossHairs } from '@/store/modules/position.store'
import ErrorMessage from '@/utils/ErrorMessage.class'
import { round } from '@/utils/numberUtils'

/**
 * The function used to dispatch the URL parameters to the store. The following options are accepted
 *
 * 1. `marker` --> place the specified marker at the center
 * 2. `marker,,`--> same as before
 * 3. `,x,y` --> place the default marker at the coordinates x,y
 * 4. `marker,x,y --> place the specified marker at the coordinates x,y
 *
 * @param {Object} to
 * @param {Object} store
 * @param {URLSearchParams} urlParamValue
 * @returns
 */

function dispatchCrossHairFromUrlIntoStore(to, store, urlParamValue) {
    const promisesForAllDispatch = []
    const error = new ErrorMessage('url_parameter_error', {
        param: 'crosshair',
        value: urlParamValue,
    })

    if (typeof urlParamValue !== 'string' && !(urlParamValue instanceof String)) {
        promisesForAllDispatch.push(
            store.dispatch('setCrossHair', {
                crossHair: null,
                dispatcher: STORE_DISPATCHER_ROUTER_PLUGIN,
            })
        )

        promisesForAllDispatch.push(
            store.dispatch('setError', { error, dispatcher: STORE_DISPATCHER_ROUTER_PLUGIN })
        )
    } else {
        const parts = urlParamValue.split(',')
        let crossHair = parts[0]
        let crossHairPosition = [parseFloat(parts[1]), parseFloat(parts[2])]
        if (isNaN(crossHairPosition[0]) || isNaN(crossHairPosition[1])) {
            crossHairPosition = null
        }

        if (
            (!crossHair && !crossHairPosition) ||
            (!Object.values(CrossHairs).includes(crossHair) && crossHair !== '')
        ) {
            promisesForAllDispatch.push(
                store.dispatch('setCrossHair', {
                    crossHair: null,
                    dispatcher: STORE_DISPATCHER_ROUTER_PLUGIN,
                })
            )
            if (urlParamValue !== undefined) {
                /**
                 * There are situations where the function is called without any parameter, and it
                 * makes some tests crash because the error message is over some necessary buttons.
                 * We consider that if the parameter is undefined, it's a choice made by the user.
                 */
                promisesForAllDispatch.push(
                    store.dispatch('setError', {
                        error,
                        dispatcher: STORE_DISPATCHER_ROUTER_PLUGIN,
                    })
                )
            }
        } else {
            if (crossHair === '') {
                crossHair = CrossHairs.marker
            }
            promisesForAllDispatch.push(
                store.dispatch('setCrossHair', {
                    crossHair,
                    crossHairPosition,
                    dispatcher: STORE_DISPATCHER_ROUTER_PLUGIN,
                })
            )
        }
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
        super({
            urlParamName: 'crosshair',
            mutationsToWatch: ['setCrossHair', 'setCrossHairPosition'],
            setValuesInStore: dispatchCrossHairFromUrlIntoStore,
            extractValueFromStore: generateCrossHairUrlParamFromStoreValues,
            keepInUrlWhenDefault: false,
            valueType: String,
            defaultValue: null,
        })
    }
}
