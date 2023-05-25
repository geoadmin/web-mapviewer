/**
 * A description of one URL param that needs synchronization with the app {@link Vuex.Store} with
 * some helper functions.
 *
 * For simple use cases, please use {@link SimpleUrlParamConfig}, otherwise you can extend this class
 * and do some advanced processing with store syncing. (see {@link LayerParamConfig} as an example)
 *
 * @abstract
 */
export default class AbstractParamConfig {
    /**
     * @param {String} urlParamName The name of the param found in the URL (e.g. 'lat' will then be
     *   https://.../?lat=value in the URL
     * @param {String} mutationsToWatch The names of the Vuex's store mutations to watch for value
     *   synchronization (separated by a coma)
     * @param {Function} setValuesInStore A function taking the store and the current URL value as
     *   params. It needs to dispatch the value of this param to the store. It must return a promise
     *   that will be resolve when the store has finished processing the dispatch.
     * @param {Function} extractValueFromStore A function taking the store in param that needs to
     *   return the value of this param found in the store
     * @param {Boolean} keepValueInUrlWhenEmpty Tells the URL manager if this param should still be
     *   added to the URL even though its value is empty. Empty means `null` or `false` for
     *   Boolean.
     * @param {NumberConstructor | StringConstructor | BooleanConstructor, ObjectConstructor} valueType
     */
    constructor(
        urlParamName,
        mutationsToWatch,
        setValuesInStore,
        extractValueFromStore,
        keepValueInUrlWhenEmpty = true,
        valueType = String
    ) {
        this.urlParamName = urlParamName
        this.mutationsToWatch = mutationsToWatch
        this.setValuesInStore = setValuesInStore
        this.extractValueFromStore = extractValueFromStore
        this.keepValueInUrlWhenEmpty = keepValueInUrlWhenEmpty
        this.valueType = valueType
    }

    /**
     * Reads the value from the given Vue router query (part of {@link RouterLink}). Depending on the
     * value of keepValueInUrlWhenEmpty, the output can be drastically different for an empty
     * query.
     *
     * When keepValueInUrlWhenEmpty=true, and the query is empty, the function will output (by type)
     * :
     *
     * - Boolean: false
     * - Number: 0
     * - String: ''
     *
     * When keepValueInUrlWhenEmpty=false, and the query is empty, the function will output (by
     * type) :
     *
     * - Boolean: undefined
     * - Number: undefined
     * - String: undefined
     *
     * @param {Object} query An object describing the route URL param
     * @returns {undefined | number | string | boolean} The value casted in the type given to the
     *   config (see constructor)
     */
    readValueFromQuery(query) {
        if (query && (this.urlParamName in query || !this.keepValueInUrlWhenEmpty)) {
            const queryValue = query[this.urlParamName]
            // Edge case here in Javascript with Boolean constructor, Boolean('false') returns true as the "object" we passed
            // to the constructor is valid and non-null. So we manage that "the old way" for booleans
            if (this.valueType === Boolean) {
                if (!this.keepValueInUrlWhenEmpty && typeof queryValue === 'undefined') {
                    return false
                } else {
                    return (
                        (typeof queryValue === 'string' && queryValue === 'true') ||
                        (typeof queryValue === 'boolean' && !!queryValue)
                    )
                }
            } else if (!(this.urlParamName in query) && !this.keepValueInUrlWhenEmpty) {
                if (this.valueType === Number) {
                    return 0
                } else if (this.valueType === String) {
                    return ''
                }
            } else {
                // if not a boolean, we can trust the other constructor (Number, String) to return a valid value whenever it is possible with the String input
                return this.valueType(queryValue)
            }
        }
        return undefined
    }

    /**
     * Reads the value from the given Vue store, and cast it in the type given in the constructor
     *
     * @param store A {@link Vuex.Store}
     * @returns {undefined | number | string | boolean} The value casted in the type given in the
     *   config (see constructor)
     */
    readValueFromStore(store) {
        if (store && this.extractValueFromStore) {
            const valueFromStore = this.extractValueFromStore(store)
            if (valueFromStore === null || valueFromStore === undefined) {
                return undefined
            }
            return this.valueType(valueFromStore)
        }
        return undefined
    }

    valuesAreDifferentBetweenQueryAndStore(query, store) {
        return this.readValueFromQuery(query) !== this.readValueFromStore(store)
    }

    /**
     * Adds the value of the store to the query object. If keepValueInUrlWhenEmpty is false, the
     * query will not be populated whenever the store value is (by type) :
     *
     * - Boolean: false or undefined or null
     * - Number: 0 or undefined or null
     * - String: '' or undefined or null
     *
     * @param {Object} query Simple Object that holds all URL parameters (key is the name of param
     *   in the URL, value is its value)
     * @param {Vuex.Store} store
     */
    populateQueryWithStoreValue(query, store) {
        if (query && this.urlParamName && this.urlParamName.length > 0) {
            const storeValue = this.readValueFromStore(store)
            if (this.keepValueInUrlWhenEmpty) {
                query[this.urlParamName] = storeValue
            } else {
                // here we shouldn't populate the query if the value in the store is considered empty
                // so we are checking all types of empty values before setting things in the query
                if (
                    storeValue !== undefined &&
                    ((this.valueType === Boolean && storeValue !== false) ||
                        (this.valueType === Number && storeValue !== 0) ||
                        (this.valueType === String && storeValue !== ''))
                ) {
                    query[this.urlParamName] = storeValue
                }
            }
        }
    }

    /**
     * Sets the store values according to the URL. Returns a promise that will resolve when the
     * store is up to date.
     *
     * @param {Vuex.Store} store
     * @param {Object | String | Number | Boolean | null} query The value found in the query
     * @returns {Promise<any>}
     */
    populateStoreWithQueryValue(store, query) {
        return new Promise((resolve, reject) => {
            if ((!this.keepValueInUrlWhenEmpty || query) && store && this.setValuesInStore) {
                const promiseSetValuesInStore = this.setValuesInStore(store, query)
                if (promiseSetValuesInStore) {
                    promiseSetValuesInStore.then(() => {
                        resolve()
                    })
                } else {
                    resolve()
                }
            } else {
                reject('Query, store or setter functions is not set')
            }
        })
    }
}
