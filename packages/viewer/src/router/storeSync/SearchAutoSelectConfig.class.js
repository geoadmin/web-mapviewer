import AbstractParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/router/storeSync/abstractParamConfig.class'
import { URL_PARAM_NAME_SWISSSEARCH } from '@/router/storeSync/SearchParamConfig.class'
import { removeQueryParamFromHref } from '@/utils/searchParamUtils'

const URL_PARAM_NAME = 'swisssearch_autoselect'
/**
 * Dispatches the 'setAutoSelect' action to the store if the URL parameter for swisssearch is
 * present.
 *
 * @param {Object} to - The target route object.
 * @param {Object} store - The Vuex store instance.
 * @param {string} urlParamValue - The value of the URL parameter to be dispatched.
 */
function dispatchAutoSelect(to, store, urlParamValue) {
    // avoiding setting the swisssearch autoselect to the store when there is nothing to autoselect because there is no swisssearch query
    if (urlParamValue && to.query[URL_PARAM_NAME_SWISSSEARCH]) {
        store.dispatch('setAutoSelect', {
            value: urlParamValue,
            dispatcher: STORE_DISPATCHER_ROUTER_PLUGIN,
        })
    }
}

export default class SearchAutoSelectConfig extends AbstractParamConfig {
    constructor() {
        super({
            urlParamName: URL_PARAM_NAME,
            mutationsToWatch: ['setAutoSelect'],
            setValuesInStore: dispatchAutoSelect,
            afterSetValuesInStore: () => removeQueryParamFromHref(URL_PARAM_NAME),
            extractValueFromStore: (store) => store.state.search.autoSelect,
            keepInUrlWhenDefault: false,
            valueType: Boolean,
            defaultValue: false,
            validateUrlInput: null,
        })
    }
}
