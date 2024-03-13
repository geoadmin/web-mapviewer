import AbstractParamConfig from '@/router/storeSync/abstractParamConfig.class'

/**
 * Definition of a URL param that needs to be synced with the store.
 *
 * It will use a function for dispatch that can be defined in the constructor
 */
export default class CustomDispatchUrlParamConfig extends AbstractParamConfig {
    /**
     * @param {String} urlParamName The name of the param found in the URL (e.g. 'lat' will then be
     *   https://.../?lat=value in the URL
     * @param {String} mutationsToWatch The names of the Vuex's store mutations to watch for value
     *   synchronization (separated by a coma)
     * @param {Function} doDispatch The function that will do the dispatch, will receive the store
     *   as the first and the URL param value as second
     * @param {Function} extractValueFromStore A function taking the store in param that needs to
     *   return the value of this param found in the store
     * @param {Boolean} keepValueInUrlWhenEmpty Tells if this param should stay in the URL query
     *   when its value is considered empty. What is considered empty depends on valueType. For
     *   Boolean, false is considered empty. For Numbers a value of zero is considered empty. For
     *   String, an empty or null string is considered empty.
     * @param {NumberConstructor | StringConstructor | BooleanConstructor} valueType
     * @param {Boolean | Number | String | null} defaultValue
     */
    constructor(
        urlParamName,
        mutationsToWatch,
        doDispatch,
        extractValueFromStore,
        keepValueInUrlWhenEmpty = true,
        valueType = String,
        defaultValue = null
    ) {
        super(
            urlParamName,
            mutationsToWatch,
            (to, store, urlParamValue) => doDispatch(to, store, urlParamValue),
            extractValueFromStore,
            keepValueInUrlWhenEmpty,
            valueType,
            defaultValue
        )
    }
}
