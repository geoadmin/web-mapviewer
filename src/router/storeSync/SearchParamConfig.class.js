import AbstractParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/router/storeSync/abstractParamConfig.class'

const URL_PARAM_NAME = 'swisssearch'
/**
 * The goal is to stop centering on the search when sharing a position. When we share a position,
 * both the center and the crosshair are sets.
 *
 * @param {Object} to The route object containing the query
 * @param {Object} store The store
 * @param {String} urlParamValue The search param
 */
function dispatchSearchFromUrl(to, store, urlParamValue) {
    // avoiding dispatching the search query to the store when there is nothing to set. Not avoiding this makes the CI test very flaky
    if (urlParamValue) {
        store.dispatch('setSearchQuery', {
            query: urlParamValue,
            shouldCenter: !(to.query.crosshair && to.query.center),
            dispatcher: STORE_DISPATCHER_ROUTER_PLUGIN,
            originUrlParam: true,
        })
    }
}

/**
 * This will remove the query param from the URL It is necessary to do this in vanilla JS because
 * the router does not provide a way to remove a query without reloading the page which then removes
 * the value from the store.
 *
 * @param {Object} key The key to remove from the URL
 */
function removeQueryParamFromHref(key) {
    const [baseUrl, queryString] = window.location.href.split('?')
    if (!queryString) {
        return
    }

    const params = new URLSearchParams(queryString)
    if (!params.has(key)) {
        return
    }
    params.delete(key)

    const newQueryString = params.toString()
    const newUrl = newQueryString ? `${baseUrl}?${newQueryString}` : baseUrl
    window.history.replaceState({}, document.title, newUrl)
}

export default class SearchParamConfig extends AbstractParamConfig {
    constructor() {
        super({
            urlParamName: URL_PARAM_NAME,
            mutationsToWatch: [],
            setValuesInStore: dispatchSearchFromUrl,
            afterSetValuesInStore: () => removeQueryParamFromHref(URL_PARAM_NAME),
            keepInUrlWhenDefault: false,
            valueType: String,
            defaultValue: '',
            validateUrlInput: null,
        })
    }
}
