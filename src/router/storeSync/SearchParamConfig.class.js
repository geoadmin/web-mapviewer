import AbstractParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/router/storeSync/abstractParamConfig.class'

/**
 * The goal is to stop centering on the search when sharing a position. When we share a position,
 * both the center and the crosshair are sets.
 *
 * @param {Object} to The route object containing the query
 * @param {Object} store The store
 * @param {String} urlParamValue The search param
 */
function dispatchSearchFromUrl(to, store, urlParamValue) {
    store.dispatch('setSearchQuery', {
        query: urlParamValue,
        shouldCenter: !(to.query.crosshair && to.query.center),
        dispatcher: STORE_DISPATCHER_ROUTER_PLUGIN,
    })
}

export default class SearchParamConfig extends AbstractParamConfig {
    constructor() {
        super({
            urlParamName: 'swisssearch',
            mutationsToWatch: ['setSearchQuery'],
            setValuesInStore: dispatchSearchFromUrl,
            extractValueFromStore: (store) => store.state.search.query,
            keepInUrlWhenDefault: false,
            valueType: String,
            defaultValue: '',
            acceptedValues: null,
        })
    }
}
