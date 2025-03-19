import AbstractParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/router/storeSync/abstractParamConfig.class'
import coordinateFromString from '@/utils/coordinates/coordinateExtractors'
import { removeQueryParamFromHref } from '@/utils/searchParamUtils'

export const URL_PARAM_NAME_SWISSSEARCH = 'swisssearch'
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
        let shouldCenter = !(to.query.crosshair && to.query.center)
        // When the query is a valid coordinate, we want to center the map
        const extractedCoordinate = coordinateFromString(to.query[URL_PARAM_NAME_SWISSSEARCH])
        if (extractedCoordinate) {
            shouldCenter = true
        }
        store.dispatch('setSearchQuery', {
            query: urlParamValue,
            shouldCenter: shouldCenter,
            dispatcher: STORE_DISPATCHER_ROUTER_PLUGIN,
            originUrlParam: true,
        })
    }
}

export default class SearchParamConfig extends AbstractParamConfig {
    constructor() {
        super({
            urlParamName: URL_PARAM_NAME_SWISSSEARCH,
            mutationsToWatch: [],
            setValuesInStore: dispatchSearchFromUrl,
            afterSetValuesInStore: () => removeQueryParamFromHref(URL_PARAM_NAME_SWISSSEARCH),
            keepInUrlWhenDefault: false,
            valueType: String,
            defaultValue: '',
            validateUrlInput: null,
        })
    }
}
