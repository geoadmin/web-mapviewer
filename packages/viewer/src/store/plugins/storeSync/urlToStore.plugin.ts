import type { PiniaPlugin, PiniaPluginContext } from 'pinia'
import type {
    LocationQuery,
    RouteLocationNamedRaw,
    RouteLocationNormalizedGeneric,
} from 'vue-router'

import log, { LogPreDefinedColor } from '@swissgeo/log'
import axios from 'axios'

import type UrlParamConfig from '@/store/plugins/storeSync/UrlParamConfig.class'
import type { UrlParamConfigTypes } from '@/store/plugins/storeSync/UrlParamConfig.class'

import { IS_TESTING_WITH_CYPRESS } from '@/config'
import { MAP_VIEW } from '@/router/viewNames'
import useAppStore from '@/store/modules/app'
import storeSyncConfig from '@/store/plugins/storeSync/storeSync.config'
import { STORE_DISPATCHER_ROUTER_PLUGIN } from '@/store/plugins/storeSync/UrlParamConfig.class'

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
): RouteLocationNamedRaw | undefined {
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

function registerRouterHooks(context: PiniaPluginContext) {
    const { store } = context

    store.router.beforeEach(
        (to: RouteLocationNormalizedGeneric, from: RouteLocationNormalizedGeneric) => {
            const appStore = useAppStore()
            if (!appStore.isParsingUrl) {
                log.debug({
                    title: 'URL param to store plugin / beforeEach',
                    titleColor: LogPreDefinedColor.Orange,
                    messages: [
                        'App is not in a state where URL syncing is activated, waiting for it to be ready',
                        to,
                        from,
                    ],
                })
                Object.assign(store.router.currentRoute.value.query, queryParamsStoredAtStartup)
                return undefined
            }

            log.debug({
                title: 'URL param to store plugin / beforeEach',
                titleColor: LogPreDefinedColor.Orange,
                messages: [
                    `Entering the store sync plugin with the following 'from' and 'to': `,
                    from,
                    to,
                ],
            })

            appStore.setHasPendingUrlParsing(true, STORE_DISPATCHER_ROUTER_PLUGIN)

            const newRoute = urlQueryWatcher(to, from)

            if (queryParamsStoredAtStartup && Object.keys(queryParamsStoredAtStartup).length > 0) {
                log.debug({
                    title: 'URL param to store plugin / beforeEach',
                    titleColor: LogPreDefinedColor.Orange,
                    messages: [
                        `Restoring URL query params stored at startup to the new route`,
                        queryParamsStoredAtStartup,
                    ],
                })
                return {
                    ...newRoute,
                    query: {
                        ...newRoute?.query,
                        ...queryParamsStoredAtStartup,
                    },
                }
            }
            return newRoute
        }
    )
    store.router.afterEach(() => {
        const appStore = useAppStore()
        if (appStore.hasPendingUrlParsing) {
            appStore.setHasPendingUrlParsing(false, STORE_DISPATCHER_ROUTER_PLUGIN)
        }
    })
}

let queryParamsStoredAtStartup: LocationQuery | undefined
let hasBeenInitialized: boolean = false

const urlToStorePlugin: PiniaPlugin = (context: PiniaPluginContext) => {
    const { store } = context

    store.$onAction(({ after }) => {
        const appStore = useAppStore()
        if (appStore.isParsingUrl && !hasBeenInitialized) {
            hasBeenInitialized = true
            after(() => {
                const firstRoute = urlQueryWatcher(store.router.currentRoute.value)
                if (firstRoute) {
                    store.router.push(firstRoute).then(() => {
                        registerRouterHooks(context)
                    })
                } else {
                    registerRouterHooks(context)
                }
                if (!appStore.initialUrlParsingHasHappened) {
                    appStore.setInitialUrlParsingHasHappened(STORE_DISPATCHER_ROUTER_PLUGIN)
                }
            })
        }
    })
}

export default urlToStorePlugin
