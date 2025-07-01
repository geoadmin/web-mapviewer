import type { RouteLocationNormalizedGeneric } from 'vue-router'

import { LogPreDefinedColor } from '@geoadmin/log'

import type { ValidationResponse } from '@/router/storeSync/validation'
import type { ActionDispatcher } from '@/store/store'

export const STORE_DISPATCHER_ROUTER_PLUGIN: ActionDispatcher = { name: 'storeSync.routerPlugin' }

/**
 * @template T1 Type of the value in the store
 * @template T2 Type of the value in the URL
 */
export interface AbstractParamConfigInput<T1, T2> {
    /**
     * The name of the param found in the URL (e.g. 'lat' will then be https://.../?lat=value in the
     * URL
     */
    urlParamName: string
    /** The names of the store mutations to watch for value synchronization */
    mutationsToWatch: string[]
    /**
     * A function taking the store and the current URL value as params. It needs to dispatch the
     * value of this param to the store. It must return a promise that will be resolved when the
     * store has finished processing the dispatch.
     */
    setValuesInStore: (to: RouteLocationNormalizedGeneric, urlParamValue?: string) => void
    /**
     * A function taking the store in param that needs to return the value of this param found in
     * the store
     */
    extractValueFromStore: () => T1
    /**
     * Tells the URL manager if this param should still be added to the URL even though its value is
     * set to the default value of the param.
     */
    keepInUrlWhenDefault: boolean
    valueType: NumberConstructor | StringConstructor | BooleanConstructor | ObjectConstructor
    defaultValue: T2 | undefined
    /** Validates the query value. Receives the store to be able to do cross-references if needed. */
    validateUrlInput: (queryValue?: string) => ValidationResponse
    /** A function that will be called after the store values have been set */
    afterSetValuesInStore: () => Promise<any>
}

/**
 * A description of one URL param that needs synchronization with the app store, with some helper
 * functions.
 *
 * @template T1 Type of the value in the store
 * @template T2 Type of the value in the URL
 */
export default class UrlParamConfig<T1, T2> {
    /**
     * The name of the param found in the URL (e.g. 'lat' will then be https://.../?lat=value in the
     * URL
     */
    readonly urlParamName: string
    /** The names of the store's mutations to watch for value synchronization */
    readonly mutationsToWatch: string[]
    /**
     * A function taking the store and the current URL value as params. It needs to dispatch the
     * value of this param to the store. It must return a promise that will be resolved when the
     * store has finished processing the dispatch.
     */
    readonly setValuesInStore: (to: RouteLocationNormalizedGeneric, urlParamValue?: string) => void
    /**
     * A function taking the store in param that needs to return the value of this param found in
     * the store
     */
    readonly extractValueFromStore: () => T1
    /**
     * Tells the URL manager if this param should still be added to the URL even though its value is
     * set to the default value of the param.
     */
    readonly keepInUrlWhenDefault: boolean
    /** Constructor to force the type to be of the T2 generic's type */
    readonly forceT2Type:
        | NumberConstructor
        | StringConstructor
        | BooleanConstructor
        | ObjectConstructor
    readonly defaultValue: T2 | undefined
    /**
     * Validates the query value. Will be triggered whenever the URL value changes, and only a
     * validated value will be pushed to the store
     */
    readonly validateUrlInput: (queryValue?: string) => ValidationResponse
    /**
     * Callback called after the store has been updated by this URL param, can be used to do some
     * post-update store cleanup
     */
    readonly afterSetValuesInStore: () => Promise<any>

    constructor(input: AbstractParamConfigInput<T1, T2>) {
        const {
            urlParamName,
            mutationsToWatch,
            setValuesInStore,
            extractValueFromStore,
            keepInUrlWhenDefault,
            valueType,
            defaultValue,
            validateUrlInput,
            afterSetValuesInStore,
        } = input
        this.urlParamName = urlParamName
        this.mutationsToWatch = mutationsToWatch
        this.setValuesInStore = setValuesInStore
        this.extractValueFromStore = extractValueFromStore
        this.keepInUrlWhenDefault = keepInUrlWhenDefault
        this.forceT2Type = valueType
        this.defaultValue = defaultValue
        if (this.forceT2Type === Boolean && this.defaultValue === undefined) {
            // forcing a proper boolean value in case we are dealing with boolean and the default
            // value is falsy
            this.defaultValue = false
        }
        this.validateUrlInput = validateUrlInput
        this.afterSetValuesInStore = afterSetValuesInStore
    }

    /**
     * Reads the value from the given Vue router query (part of
     * {@link RouteLocationNormalizedGeneric}). Depending on the value of keepInUrlWhenDefault, the
     * output can be drastically different for an empty query.
     *
     * @param query An object describing the route URL param
     * @returns Value cast as the type given to the config (see constructor)
     */
    readValueFromQuery(query?: URLSearchParams): T2 | undefined {
        if (!query) {
            return undefined
        }

        if (!(this.urlParamName in query) || query[this.urlParamName] === undefined) {
            if (!this.keepInUrlWhenDefault) {
                return this.defaultValue
            } else {
                return undefined
            }
        }

        const queryValue = query[this.urlParamName]

        if (this.forceT2Type === Boolean) {
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
        return this.forceT2Type(queryValue)
    }

    /**
     * Reads the value from the given Vue store, and cast it in the type given in the constructor
     *
     * @returns The value in the type given in the config (see constructor)
     */
    readValueFromStore(): T2 | undefined {
        if (this.extractValueFromStore) {
            const valueFromStore = this.extractValueFromStore()
            // with boolean types, we let undefined and null values go through, so that they are interpreted as false
            // for all other types, we force the output of null and undefined to undefined
            if (
                this.forceT2Type !== Boolean &&
                (valueFromStore === null || valueFromStore === undefined)
            ) {
                return undefined
            }
            return this.forceT2Type(valueFromStore)
        }
        return undefined
    }

    valuesAreDifferentBetweenQueryAndStore(query?: URLSearchParams): boolean {
        return this.readValueFromQuery(query) !== this.readValueFromStore()
    }

    /**
     * Adds the value of the store to the query object. If keepInUrlWhenDefault is false, the query
     * will not be populated whenever the store value is set to its default value
     */
    populateQueryWithStoreValue(query?: URLSearchParams): void {
        if (query && this.urlParamName && this.urlParamName.length > 0) {
            const storeValue = this.readValueFromStore()
            // we add the value in the query only if it is different from the default value
            // or if keepInUrlWhenDefault is true, it is always added
            if (this.keepInUrlWhenDefault || this.defaultValue !== storeValue) {
                if (this.forceT2Type === Boolean) {
                    query[this.urlParamName] = storeValue ? null : false
                } else {
                    query[this.urlParamName] = storeValue
                }
            }
        }
    }

    /**
     * Sets the store values according to the URL. Returns a promise that will resolve when the
     * store is up-to-date.
     */
    populateStoreWithQueryValue(to: RouteLocationNormalizedGeneric, queryValue: T2): void {
        if (this.setValuesInStore) {
            this.setValuesInStore(to, queryValue)
        } else {
            log.error({
                title: 'UrlParamConfig / populateStoreWithQueryValue',
                titleStyle: {
                    backgroundColor: LogPreDefinedColor.Purple,
                },
                messages: ['Query, store or setter functions is not set'],
            })
        }
    }

    /** Triggers an action after the store has been populated with the query value. Returns a promise */
    async afterPopulateStore(): Promise<any> {
        if (!this.afterSetValuesInStore) {
            return
        }
        return await this.afterSetValuesInStore()
    }
}
