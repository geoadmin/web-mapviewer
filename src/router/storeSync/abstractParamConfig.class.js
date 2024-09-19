// NOTE: This is exported but should only be used in this module, if the value is needed outside

import ErrorMessage from '@/utils/ErrorMessage.class'

// of this module we should use the string directly to avoid module dependencies.
export const STORE_DISPATCHER_ROUTER_PLUGIN = 'storeSync.routerPlugin'

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
     * @param {[String]} mutationsToWatch The names of the Vuex's store mutations to watch for value
     *   synchronization
     * @param {Function} setValuesInStore A function taking the store and the current URL value as
     *   params. It needs to dispatch the value of this param to the store. It must return a promise
     *   that will be resolved when the store has finished processing the dispatch.
     * @param {Function} extractValueFromStore A function taking the store in param that needs to
     *   return the value of this param found in the store
     * @param {Boolean} keepInUrlWhenDefault Tells the URL manager if this param should still be
     *   added to the URL even though its value is set to the default value of the param.
     * @param {NumberConstructor | StringConstructor | BooleanConstructor, ObjectConstructor} valueType
     * @param {Boolean | Number | String | null} defaultValue
     */
    constructor({
        urlParamName,
        mutationsToWatch,
        setValuesInStore,
        extractValueFromStore,
        keepInUrlWhenDefault = true,
        valueType = String,
        defaultValue = null,
        validateUrlInput = null,
    } = {}) {
        this.urlParamName = urlParamName
        this.mutationsToWatch = mutationsToWatch
        this.setValuesInStore = setValuesInStore
        this.extractValueFromStore = extractValueFromStore
        this.keepInUrlWhenDefault = keepInUrlWhenDefault
        this.valueType = valueType
        this.defaultValue = defaultValue
        if (this.valueType === Boolean && this.defaultValue === null) {
            // forcing a proper boolean value in case we are dealing with boolean and the default
            // value is falsy
            this.defaultValue = false
        }
        this.validateUrlInput = validateUrlInput
    }

    /**
     * Reads the value from the given Vue router query (part of {@link RouterLink}). Depending on the
     * value of keepInUrlWhenDefault, the output can be drastically different for an empty query.
     *
     * @param {Object} query An object describing the route URL param
     * @returns {undefined | number | string | boolean} The value casted in the type given to the
     *   config (see constructor)
     */
    readValueFromQuery(query) {
        if (!query) {
            return undefined
        }
        if (!(this.urlParamName in query)) {
            if (!this.keepInUrlWhenDefault) {
                return this.defaultValue
            } else {
                return undefined
            }
        }
        const queryValue = query[this.urlParamName]
        if (this.valueType === Boolean) {
            // Edge case here in Javascript with Boolean constructor, Boolean('false') returns true as the "object"
            // we passed to the constructor is valid and non-null. So we manage that "the old way" for booleans

            // as we also want to be able to activate a boolean just by having the param name in the URL query
            // (i.e. if '...&embed&...' is there, it means embed === true) we return true as soon as the param name
            // is present in the query (without a boolean value attached)
            return (
                queryValue === null ||
                queryValue === 'true' ||
                queryValue === '' ||
                (typeof queryValue === 'boolean' && !!queryValue)
            )
        } else if (queryValue === null || queryValue === undefined) {
            return this.defaultValue
        }
        return this.valueType(queryValue)
    }

    /**
     * Reads the value from the given Vue store, and cast it in the type given in the constructor
     *
     * NOTE: When the store value is null, it is cast to undefined
     *
     * @param store A {@link Vuex.Store}
     * @returns {undefined | number | string | boolean} The value casted in the type given in the
     *   config (see constructor)
     */
    readValueFromStore(store) {
        if (store && this.extractValueFromStore) {
            const valueFromStore = this.extractValueFromStore(store)
            // with boolean types, we let undefined and null values go through, so that they are interpreted as false
            // for all other types, we force the output of null and undefined to undefined
            if (
                this.valueType !== Boolean &&
                (valueFromStore === null || valueFromStore === undefined)
            ) {
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
     * Adds the value of the store to the query object. If keepInUrlWhenDefault is false, the query
     * will not be populated whenever the store value is set to its default value
     *
     * @param {Object} query Simple Object that holds all URL parameters (key is the name of param
     *   in the URL, value is its value)
     * @param {Vuex.Store} store
     */
    populateQueryWithStoreValue(query, store) {
        if (query && this.urlParamName && this.urlParamName.length > 0) {
            const storeValue = this.readValueFromStore(store)
            // we add the value in the query only if it is different from the default value
            // or if keepInUrlWhenDefault is true, it is always added
            if (this.keepInUrlWhenDefault || this.defaultValue !== storeValue) {
                if (this.valueType === Boolean) {
                    query[this.urlParamName] = storeValue ? null : false
                } else {
                    query[this.urlParamName] = storeValue
                }
            }
        }
    }

    getStandardErrorMessage(query) {
        return new ErrorMessage('url_parameter_error', { param: this.urlParamName, value: query })
    }

    /**
     * Return the standard feedback for most parameters given in the URL: if the query is validated,
     * it can proceed and be set in the store.
     *
     * @param {any} query The value of the URL parameter given
     * @param {Boolean} is_valid Is the value valid or not
     * @returns
     */
    getStandardValidationResponse(query, is_valid) {
        console.error('ENTRY IN STANDARD VALIDATION RESPONSE')
        console.error(query)
        console.error(is_valid)
        return {
            valid: is_valid,
            errors: is_valid ? null : this.getStandardErrorMessage(query),
        }
    }
    /**
     * Sets the store values according to the URL. Returns a promise that will resolve when the
     * store is up-to-date.
     *
     * @param {VueRouter.Route} to
     * @param {Vuex.Store} store
     * @param {Object | String | Number | Boolean | null} query The value found in the query
     * @returns {Promise<any>}
     */
    populateStoreWithQueryValue(to, store, query) {
        return new Promise((resolve, reject) => {
            if (store && this.setValuesInStore) {
                // when removing a parameter from the URL, this sends a query to populate the store with
                // the query value, with the param being absent from the query. In this case, we don't
                // try to validate the input.
                let inputValidation =
                    to.query[this.urlParamName] && this.validateUrlInput
                        ? this.validateUrlInput(store, query)
                        : { valid: true }

                // if there are no errors, we want to avoid dispatching and commiting, as it is costly
                if (inputValidation.errors) {
                    store.dispatch('addErrors', {
                        errors: inputValidation.errors,
                        dispatcher: STORE_DISPATCHER_ROUTER_PLUGIN,
                    })
                }

                if (inputValidation.warnings) {
                    store.dispatch('addWarnings', {
                        errors: inputValidation.warnings,
                        dispatcher: STORE_DISPATCHER_ROUTER_PLUGIN,
                    })
                }

                if (inputValidation.valid) {
                    const promiseSetValuesInStore = this.setValuesInStore(to, store, query)
                    if (promiseSetValuesInStore) {
                        promiseSetValuesInStore.then(() => {
                            resolve()
                        })
                    } else {
                        resolve()
                    }
                } else {
                    resolve()
                }
            } else {
                reject('Query, store or setter functions is not set')
            }
        })
    }
}

// validateUrlInput --> return an object in the form {valid:bool ; warnings : [], errors: []}
