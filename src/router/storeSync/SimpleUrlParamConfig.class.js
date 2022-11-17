import AbstractParamConfig from '@/router/storeSync/abstractParamConfig.class'

/**
 * Definition of a URL param that needs to be synced with the store.
 *
 * It will use a single 'dispatch' to do so, described as `dispatchChangeTo`.
 */
export default class SimpleUrlParamConfig extends AbstractParamConfig {
    /**
     * @param {String} urlParamName The name of the param found in the URL (e.g. 'lat' will then be
     *   https://.../?lat=value in the URL
     * @param {String} mutationsToWatch The names of the Vuex's store mutations to watch for value
     *   synchronization (separated by a coma)
     * @param {String} dispatchChangeTo The name of the Vuex's store action where to publish changes
     *   made in the URL
     * @param {Function} extractValueFromStore A function taking the store in param that needs to
     *   return the value of this param found in the store
     * @param {Boolean} keepValueInUrlWhenEmpty Tells if this param should stay in the URL query
     *   when its value is considered empty. What is considered empty depends on valueType. For
     *   Boolean, false is considered empty. For Numbers a value of zero is considered empty. For
     *   String, an empty or null string is considered empty.
     * @param {NumberConstructor | StringConstructor | BooleanConstructor} valueType
     */
    constructor(
        urlParamName,
        mutationsToWatch,
        dispatchChangeTo,
        extractValueFromStore,
        keepValueInUrlWhenEmpty = true,
        valueType = String
    ) {
        super(
            urlParamName,
            mutationsToWatch,
            (store, urlParamValue) => store.dispatch(dispatchChangeTo, urlParamValue),
            extractValueFromStore,
            keepValueInUrlWhenEmpty,
            valueType
        )
    }
}
