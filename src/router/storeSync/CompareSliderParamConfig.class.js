import { getStandardValidationResponse } from '@/api/errorQueues.api'
import AbstractParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/router/storeSync/abstractParamConfig.class'

function dispatchCompareSliderFromUrlParam(to, store, urlParamValue) {
    const promisesForAllDispatch = []
    if (urlParamValue) {
        promisesForAllDispatch.push(
            store.dispatch('setCompareRatio', {
                compareRatio: urlParamValue,
                dispatcher: STORE_DISPATCHER_ROUTER_PLUGIN,
            })
        )
        // small check here: if the user is inserting a non valid value, we won't activate the slider
        if (urlParamValue > 0.0 && urlParamValue < 1.0) {
            promisesForAllDispatch.push(
                store.dispatch('setCompareSliderActive', {
                    compareSliderActive: true,
                    dispatcher: STORE_DISPATCHER_ROUTER_PLUGIN,
                })
            )
        }
    }
    return Promise.all(promisesForAllDispatch)
}

function generateCompareSliderUrlParamFromStore(store) {
    if (store.state.ui.compareRatio !== null && store.state.ui.isCompareSliderActive) {
        return store.state.ui.compareRatio
    }
    return null
}

/**
 * This ensure the following: When the compare ratio is set in the url, the flag telling if the
 * compare slider is active is set to true. We remove the compareRatio parameter from the URL when
 * the compare slider is not active The default value of the parameter is null
 */
export default class CompareSliderParamConfig extends AbstractParamConfig {
    constructor() {
        super({
            urlParamName: 'compareRatio',
            mutationsToWatch: ['setCompareRatio', 'setCompareSliderActive'],
            setValuesInStore: dispatchCompareSliderFromUrlParam,
            extractValueFromStore: generateCompareSliderUrlParamFromStore,
            keepInUrlWhenDefault: false,
            valueType: Number,
            defaultValue: null,
            validateUrlInput: (store, query) =>
                getStandardValidationResponse(
                    query,
                    query && Number(query) <= 1.0 && Number(query) >= 0.0
                ),
        })
    }
}
