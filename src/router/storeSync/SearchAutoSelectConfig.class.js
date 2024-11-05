import AbstractParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/router/storeSync/abstractParamConfig.class'
import { removeQueryParamFromHref } from '@/utils/searchParamUtils'

import { URL_PARAM_NAME_SWISSSEARCH } from './SearchParamConfig.class'

const URL_PARAM_NAME = 'swisssearch_autoselect'
/**
 * The goal is to stop centering on the search when sharing a position. When we share a position,
 * both the center and the crosshair are sets.
 *
 * @param {Object} to The route object containing the query
 * @param {Object} store The store
 * @param {String} urlParamValue The search param
 */
function dispatchSearchFromUrl(to, store, urlParamValue) {
    // avoiding setting the swisssearch autoselect to the store when there is nothing to autoselect because there is no swisssearch query
    if (urlParamValue && to.query[URL_PARAM_NAME_SWISSSEARCH]) {
        store.dispatch('setSwisssearchAutoSelect', {
            value: urlParamValue,
            dispatcher: STORE_DISPATCHER_ROUTER_PLUGIN,
        })
    }
}

export default class SearchAutoSelectConfig extends AbstractParamConfig {
    constructor() {
        super({
            urlParamName: URL_PARAM_NAME,
            mutationsToWatch: ['setSwisssearchAutoSelect'],
            setValuesInStore: dispatchSearchFromUrl,
            afterSetValuesInStore: () => removeQueryParamFromHref(URL_PARAM_NAME),
            extractValueFromStore: (store) => store.state.search.swisssearchAutoSelect,
            keepInUrlWhenDefault: false,
            valueType: Boolean,
            defaultValue: false,
            validateUrlInput: null,
        })
    }
}
