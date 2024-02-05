import AbstractParamConfig from '@/router/storeSync/abstractParamConfig.class'

function dispatchCompareSliderFromUrlParam(store, urlParamValue) {
    const promisesForAllDispatch = []
    if (urlParamValue) {
        promisesForAllDispatch.push(store.dispatch('setCompareSliderActive', true))
        promisesForAllDispatch.push(store.dispatch('setCompareRatio', urlParamValue))
    } else {
        promisesForAllDispatch.push(store.dispatch('setCompareRatio', null))
    }
    return Promise.all(promisesForAllDispatch)
}

function generateCompareSliderUrlParamFromStore(store) {
    if (store.state.ui.compareRatio !== null && store.state.ui.isCompareSliderActive === true) {
        return store.state.ui.compareRatio
    }
    return null
}

/**
 * This ensure the following: When the compare ratio is set in the url, the flag telling if the
 * compare slider is active is set to true. We remove the compare_ratio parameter from the URL when
 * the compare slider is not active The default value of the parameter is null
 */
export default class CompareSliderParamConfig extends AbstractParamConfig {
    constructor() {
        super(
            'compare_ratio',
            'setCompareRatio, setCompareSliderActive',
            dispatchCompareSliderFromUrlParam,
            generateCompareSliderUrlParamFromStore,
            false,
            Number,
            null
        )
    }
}
