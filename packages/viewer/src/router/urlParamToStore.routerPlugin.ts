import type { LocationQuery, RouteLocationNormalizedGeneric } from 'vue-router'

import log, { LogPreDefinedColor } from '@swissgeo/log'
import axios from 'axios'

import type { RouterPlugin } from '@/router/types'

import { IS_TESTING_WITH_CYPRESS } from '@/config/staging.config'
import { MAP_VIEW, MAP_VIEWS } from '@/router/viewNames'
import storeSyncConfig from '@/store/plugins/storeSync/storeSync.config'
import UrlParamConfig, {
    type UrlParamConfigTypes,
} from '@/store/plugins/storeSync/UrlParamConfig.class'

export const FAKE_URL_CALLED_AFTER_ROUTE_CHANGE: string = '/tell-cypress-route-has-changed'

// flag to distinguish URL change originated by this module or by another source
let routeChangeIsTriggeredByThisModule = false

/**
 * Watch for URL query parameter changes and sync the store if needed.
 *
 * Also add missing URL query parameter with default value (store value).
 *
 * @returns Returns undefined to validate the navigation (no query changes), false to cancel the
 *   navigation or RouteLocationRaw to change url query parameter.
 */
function urlQueryWatcher(
    to: RouteLocationNormalizedGeneric,
    from?: RouteLocationNormalizedGeneric
) {
    log.debug({
        title: 'URL param to store plugin   / urlQueryWatcher',
        titleColor: LogPreDefinedColor.Orange,
        messages: [`Entering the url query watcher function`, to, from],
    })
    if (routeChangeIsTriggeredByThisModule) {
        log.debug({
            title: 'URL param to store plugin   / urlQueryWatcher',
            titleColor: LogPreDefinedColor.Orange,
            messages: [`Url query watcher triggered by itself, ignoring the call`, to],
        })
        // Only sync route params when the route change has not been
        // triggered by the sync from store mutations watcher above.
        routeChangeIsTriggeredByThisModule = false
        return undefined
    }
    log.debug({
        title: 'URL param to store plugin   / urlQueryWatcher',
        titleColor: LogPreDefinedColor.Orange,
        messages: [`Queries 'from' and 'to' are :`, from?.query, to.query],
    })
    let requireQueryUpdate = false
    const newQuery: LocationQuery = { ...to.query }

    function useParamConfig<T extends string | number | boolean>(paramConfig: UrlParamConfig<T>) {
        const queryValue = paramConfig.readValueFromQuery(to.query)
        const storeValue = paramConfig.readValueFromStore()

        const setValueInStore = (paramConfig: UrlParamConfig<T>, value?: T) => {
            paramConfig.populateStoreWithQueryValue(to, value)
            paramConfig.afterPopulateStore()
        }

        if (
            // when the query value is an empty string, queryValue is false.
            (queryValue || queryValue === '') &&
            queryValue !== storeValue &&
            // if the query is undefined and the store is undefined, we also don't dispatch it,
            // as we want to avoid changing the store value for no reason.
            !(queryValue === undefined && storeValue === undefined)
        ) {
            // dispatching URL value to the store
            log.debug({
                title: 'URL param to store plugin   / urlQueryWatcher',
                titleColor: LogPreDefinedColor.Orange,
                messages: [
                    'param',
                    paramConfig.urlParamName,
                    ': dispatching to store with value',
                    queryValue,
                ],
            })
            setValueInStore(paramConfig, queryValue)
        } else if (!queryValue && storeValue) {
            if (paramConfig.keepInUrlWhenDefault) {
                // if we don't have a query value but a store value update the url query with it
                log.debug({
                    title: 'URL param to store plugin   / urlQueryWatcher',
                    titleColor: LogPreDefinedColor.Orange,
                    messages: [
                        'param',
                        paramConfig.urlParamName,
                        ': was not present in URL, setting it back with value',
                        storeValue,
                    ],
                })
                newQuery[paramConfig.urlParamName] = `${storeValue}`
            } else {
                // If the query value has been removed (or set to false for a Boolean) and is meant to disappear from
                // the URL with this value, we set it to a falsy value in the store and remove it from the URL
                log.debug({
                    title: 'URL param to store plugin   / urlQueryWatcher',
                    titleColor: LogPreDefinedColor.Orange,
                    messages: [
                        'param',
                        paramConfig.urlParamName,
                        ': has been removed from the URL, setting it to falsy value in the store',
                    ],
                })
                setValueInStore(
                    paramConfig,
                    paramConfig.valueType === Boolean ? (false as T) : paramConfig.defaultValue
                )
                delete newQuery[paramConfig.urlParamName]
            }
            requireQueryUpdate = true
        }
    }

    // if this module did not trigger the route change, we need to check if a store change is needed
    storeSyncConfig.forEach((paramConfig: UrlParamConfigTypes) => {
        if (paramConfig.valueType === Boolean) {
            useParamConfig<boolean>(paramConfig as UrlParamConfig<boolean>)
        } else if (paramConfig.valueType === Number) {
            useParamConfig<number>(paramConfig as UrlParamConfig<number>)
        } else {
            useParamConfig<string>(paramConfig as UrlParamConfig<string>)
        }
    })

    // Fake call to a URL so that Cypress can wait for route changes without waiting for arbitrary length of time
    if (IS_TESTING_WITH_CYPRESS) {
        axios({
            url: FAKE_URL_CALLED_AFTER_ROUTE_CHANGE,
        }).catch((error) => {
            log.error({
                title: 'URL param to store plugin   / urlQueryWatcher',
                titleColor: LogPreDefinedColor.Orange,
                messages: [
                    `Error while calling fake URL to trigger route change in Cypress`,
                    error,
                ],
            })
        })
    }

    if (requireQueryUpdate) {
        log.debug({
            title: 'URL param to store plugin   / urlQueryWatcher',
            titleColor: LogPreDefinedColor.Orange,
            messages: [`Update URL query to ${JSON.stringify(newQuery)}`],
        })
        // NOTE: this rewrite of query currently don't work when navigating manually got the `/#/`
        // URL. This should actually change the url to `/#/map?...` with the correct query, but it
        // stays on `/#/`. When manually changing any query param it works though.
        return { name: to.name ?? MAP_VIEW, query: newQuery }
    }
    return undefined
}

const urlParamToStore: RouterPlugin = (router) => {
    router.beforeEach(
        (to: RouteLocationNormalizedGeneric, from: RouteLocationNormalizedGeneric) => {
            log.debug({
                title: 'URL param to store plugin / beforeEach',
                titleColor: LogPreDefinedColor.Orange,
                messages: [
                    `Entering the store sync plugin with the following 'from' and 'to': `,
                    from,
                    to,
                ],
            })

            // we define a return Value, so we can check across the function what its value is
            let retVal = undefined

            if (typeof to.name === 'string' && !MAP_VIEWS.includes(to.name)) {
                log.debug({
                    title: 'URL param to store plugin / beforeEach',
                    titleColor: LogPreDefinedColor.Orange,
                    messages: [`leaving the map view`, from, to],
                })
                retVal = undefined
            } else {
                log.debug({
                    title: 'URL param to store plugin / beforeEach',
                    titleColor: LogPreDefinedColor.Orange,
                    messages: [`Starting URL query watcher`, from, to],
                })
                // Synchronize the store with the url query only on MapView and when the application is ready
                retVal = urlQueryWatcher(to, from)
            }

            // Note we return undefined to validate the route, see Vue Router documentation
            return retVal
        }
    )
}

export default urlParamToStore
