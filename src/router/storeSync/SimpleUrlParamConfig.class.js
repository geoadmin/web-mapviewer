import AbstractParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/router/storeSync/abstractParamConfig.class'

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
     * @param {Boolean} keepInUrlWhenDefault Tells the URL manager if this param should still be
     *   added to the URL even though its value is set to the default value of the param.
     * @param {NumberConstructor | StringConstructor | BooleanConstructor} valueType
     * @param {Boolean | Number | String | null} defaultValue
     */
    constructor(
        urlParamName,
        mutationsToWatch,
        dispatchChangeTo,
        extractValueFromStore,
        keepInUrlWhenDefault = false,
        valueType = String,
        defaultValue = null
    ) {
        super(
            urlParamName,
            mutationsToWatch,
            (store, urlParamValue) =>
                store.dispatch(dispatchChangeTo, {
                    value: urlParamValue,
                    dispatcher: STORE_DISPATCHER_ROUTER_PLUGIN,
                }),
            extractValueFromStore,
            keepInUrlWhenDefault,
            valueType,
            defaultValue
        )
    }
}
