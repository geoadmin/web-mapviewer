import type { Store } from 'pinia'
import type { LocationQuery, RouteLocationNormalizedGeneric, Router } from 'vue-router'

import log, { LogPreDefinedColor } from '@swissgeo/log'
import axios from 'axios'

import type { RouterPlugin } from '@/router/types'
import type { ActionDispatcher } from '@/store/types'

import { IS_TESTING_WITH_CYPRESS } from '@/config/staging.config'
import storeSyncConfig from '@/router/storeSync/storeSync.config'
import UrlParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
    type UrlParamConfigTypes,
} from '@/router/storeSync/UrlParamConfig.class'
import { MAP_VIEWS } from '@/router/viewNames'
import useAppStore from '@/store/modules/app'
import useCesiumStore from '@/store/modules/cesium'
import useDebugStore from '@/store/modules/debug'
import useGeolocationStore from '@/store/modules/geolocation'
import useI18nStore from '@/store/modules/i18n'
import useLayersStore from '@/store/modules/layers'
import usePositionStore from '@/store/modules/position'
import usePrintStore from '@/store/modules/print'
import useSearchStore from '@/store/modules/search'
import useShareStore from '@/store/modules/share'
import useTopicsStore from '@/store/modules/topics'
import useUIStore from '@/store/modules/ui'

export const FAKE_URL_CALLED_AFTER_ROUTE_CHANGE: string = '/tell-cypress-route-has-changed'
const watchedActions: string[] = [
    ...storeSyncConfig.flatMap((paramConfig: UrlParamConfigTypes) => paramConfig.actionsToWatch),
].filter((actionName: string, index: number, self: string[]) => self.indexOf(actionName) === index)

const isActionNotTriggeredByModule = (args: unknown[]): boolean => {
    // last argument is the dispatcher
    const dispatcher = args.slice(-1) as unknown as ActionDispatcher
    return dispatcher.name !== STORE_DISPATCHER_ROUTER_PLUGIN.name
}
const isActionWatched = (actionName: string): boolean => watchedActions.includes(actionName)

/**
 * Checks all param in the current route and the store to see if there's a difference in values
 *
 * @returns True if a value is different between the store and the URL
 */
function isRoutePushNeeded(currentRoute: RouteLocationNormalizedGeneric): boolean {
    let aRoutePushIsNeeded = false
    storeSyncConfig.forEach(
        (paramConfig: UrlParamConfigTypes) =>
            aRoutePushIsNeeded ||
            (aRoutePushIsNeeded = paramConfig.valuesAreDifferentBetweenQueryAndStore(
                currentRoute.query
            ))
    )
    return aRoutePushIsNeeded
}

// flag to distinguish URL change originated by this module or by another source
let routeChangeIsTriggeredByThisModule = false

/** Watch for store changes and reflect the changes in the URL query param if needed */
function storeMutationWatcher(actionName: string, actionArgs: unknown[], router: Router): void {
    // Ignore mutation that has been triggered by the router plugin
    if (isActionNotTriggeredByModule(actionArgs) && isActionWatched(actionName)) {
        log.debug({
            title: 'Router store plugin / storeMutationWatcher',
            titleColor: LogPreDefinedColor.Rose,
            messages: [actionName, 'Current route', router.currentRoute.value],
        })

        // if the value in the store differs from the one in the URL
        if (isRoutePushNeeded(router.currentRoute.value)) {
            const query: LocationQuery = {}
            // extracting all param from the store
            storeSyncConfig.forEach((paramConfig: UrlParamConfigTypes) =>
                paramConfig.populateQueryWithStoreValue(query)
            )
            log.info({
                title: 'Router store plugin / storeMutationWatcher',
                titleColor: LogPreDefinedColor.Rose,
                messages: [
                    'Store has changed, rerouting app to query',
                    query,
                    router.currentRoute.value.name,
                ],
            })
            routeChangeIsTriggeredByThisModule = true
            router
                .push({
                    name: router.currentRoute.value.name,
                    query,
                })
                .catch((error) => {
                    log.error({
                        title: 'Router store plugin / storeMutationWatcher',
                        titleColor: LogPreDefinedColor.Rose,
                        messages: ['Error while routing to', query, error],
                    })
                })
                .finally(() => {
                    routeChangeIsTriggeredByThisModule = false
                })

            const shareStore = useShareStore()
            // if the short linked version of the URL is already defined,
            // and the share menu opened, we must close the share menu and
            // reset the shortlink
            if (shareStore.shortLink) {
                shareStore.closeShareMenuAndRemoveShortLinks(STORE_DISPATCHER_ROUTER_PLUGIN)
            }
        }
    }
}

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
        title: 'Router store plugin / urlQueryWatcher',
        titleColor: LogPreDefinedColor.Rose,
        messages: [`Entering the url query watcher function`, to, from],
    })
    if (routeChangeIsTriggeredByThisModule) {
        log.debug({
            title: 'Router store plugin / urlQueryWatcher',
            titleColor: LogPreDefinedColor.Rose,
            messages: [`Url query watcher triggered by itself, ignoring the call`, to],
        })
        // Only sync route params when the route change has not been
        // triggered by the sync from store mutations watcher above.
        routeChangeIsTriggeredByThisModule = false
        return undefined
    }
    log.debug({
        title: 'Router store plugin / urlQueryWatcher',
        titleColor: LogPreDefinedColor.Rose,
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
            // if the query is undefined and the store is null, we also don't dispatch it, as we want
            // to avoid changing the store value for no reason.
            !(queryValue === undefined && storeValue === undefined)
        ) {
            // dispatching URL value to the store
            log.debug({
                title: 'Router store plugin / urlQueryWatcher',
                titleColor: LogPreDefinedColor.Rose,
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
                    title: 'Router store plugin / urlQueryWatcher',
                    titleColor: LogPreDefinedColor.Rose,
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
                    title: 'Router store plugin / urlQueryWatcher',
                    titleColor: LogPreDefinedColor.Rose,
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
                title: 'Router store plugin / urlQueryWatcher',
                titleColor: LogPreDefinedColor.Rose,
                messages: [
                    `Error while calling fake URL to trigger route change in Cypress`,
                    error,
                ],
            })
        })
    }
    if (requireQueryUpdate) {
        log.debug({
            title: 'Router store plugin / urlQueryWatcher',
            titleColor: LogPreDefinedColor.Rose,
            messages: [`Update URL query to ${JSON.stringify(newQuery)}`],
        })
        // NOTE: this rewrite of query currently don't work when navigating manually got the `/#/`
        // URL. This should actually change the url to `/#/map?...` with the correct query, but it
        // stays on `/#/`. When manually changing any query param it works though.
        return { name: to.name, query: newQuery }
    }
    return undefined
}

function initialUrlQueryWatcher(to: RouteLocationNormalizedGeneric, router: Router) {
    const newRoute = urlQueryWatcher(to)
    if (newRoute) {
        router.push(newRoute).catch((error) => {
            log.error({
                title: 'Router store plugin/initialUrlQueryWatcher',
                titleColor: LogPreDefinedColor.Rose,
                messages: ['Error while routing to', newRoute, error],
            })
        })
    }
}

/**
 * Plugin that syncs what is in the URL with what is in the store (and vice-versa). It also reacts
 * to on-the-fly changes in the URL and commit the changes to the store.
 *
 * NOTE: This plugin subscribe on store mutation only when on the MapView because we don't want to
 * change the url when the app is not on the MapView. The store is also only updated with the query
 * parameter when on the MapView.
 */
const storeSyncRouterPlugin: RouterPlugin = (router): void => {

    let unsubscribeAppReadyMutation: () => void
    let unsubscribeCesiumMutation: () => void
    let unsubscribeDebugMutation: () => void
    let unsubscribeGeolocationMutation: () => void
    let unsubscribeI18nMutation: () => void
    let unsubscribeLayerMutation: () => void
    let unsubscribePositionMutation: () => void
    let unsubscribePrintMutation: () => void
    let unsubscribeSearchMutation: () => void
    let unsubscribeTopicMutation: () => void
    let unsubscribeUIMutation: () => void

    router.beforeEach(
        (to: RouteLocationNormalizedGeneric, from: RouteLocationNormalizedGeneric) => {
            log.debug({
                title: 'Router store plugin/beforeEach',
                titleColor: LogPreDefinedColor.Rose,
                messages: [
                    `Entering the store sync plugin with the following 'from' and 'to': `,
                    from,
                    to,
                ],
            })

            const appStore = useAppStore()

            // we define a return Value, so we can check across the function what its value is
            let retVal = undefined

            if (typeof to.name === 'string' && !MAP_VIEWS.includes(to.name)) {
                log.debug({
                    title: 'Router store plugin/beforeEach',
                    titleColor: LogPreDefinedColor.Rose,
                    messages: [`leaving the map view`, from, to],
                })
                // leaving MapView make sure to unsubscribe the store mutation
                if (unsubscribeAppReadyMutation) {
                    log.info({
                        title: 'Router store plugin/beforeEach',
                        titleColor: LogPreDefinedColor.Rose,
                        messages: [`Leaving ${to.name}, unregister store mutation watcher`],
                    })
                    unsubscribeAppReadyMutation()
                    if (
                        unsubscribePositionMutation &&
                        unsubscribeDebugMutation &&
                        unsubscribeTopicMutation &&
                        unsubscribeLayerMutation &&
                        unsubscribeSearchMutation &&
                        unsubscribeUIMutation &&
                        unsubscribeI18nMutation &&
                        unsubscribeCesiumMutation &&
                        unsubscribeGeolocationMutation &&
                        unsubscribePrintMutation
                    ) {
                            unsubscribePositionMutation()
                            unsubscribeDebugMutation()
                            unsubscribeTopicMutation()
                            unsubscribeLayerMutation()
                            unsubscribeSearchMutation()
                            unsubscribeUIMutation()
                            unsubscribeI18nMutation()
                            unsubscribeCesiumMutation()
                            unsubscribeGeolocationMutation()
                            unsubscribePrintMutation()
                        }
                    retVal = undefined
                }
            } else if (appStore.isReady) {
                log.debug({
                    title: 'Router store plugin/beforeEach',
                    titleColor: LogPreDefinedColor.Rose,
                    messages: [`URL change while app is ready, process new url`, from, to],
                })
                // Synchronize the store with the url query only on MapView and when the application
                // is ready
                retVal = urlQueryWatcher(to, from)
            } else {
                log.info({
                    title: 'Router store plugin/beforeEach',
                    titleColor: LogPreDefinedColor.Rose,
                    messages: [
                        `URL change while app is not ready, do not process new url`,
                        from,
                        to,
                    ],
                })
            }

            log.debug({
                title: 'Router store plugin/beforeEach',
                titleColor: LogPreDefinedColor.Rose,
                messages: [
                    `exiting navigation guard`,
                    from,
                    to,
                    `with the following value`,
                    retVal,
                ],
            })
            // Note we return undefined to validate the route, see Vue Router documentation
            return retVal
        }
    )

    // There were cases were this mutation subscription would trigger too early after a legacy query.
    // This would cause the storeMutationWatcher to push a new route with its 'currentRoute' value,
    // which was LEGACY. By moving this subscription to the after Each loop, we ensure the 'currentRoute'
    // is always set to MAPVIEW, avoiding a lock of the viewer.
    router.afterEach((to: RouteLocationNormalizedGeneric) => {

        if (
            typeof to.name === 'string' &&
            MAP_VIEWS.includes(to.name) &&
            !unsubscribeAppReadyMutation
        ) {
            log.info({
                title: 'Router store plugin/afterEach',
                titleColor: LogPreDefinedColor.Rose,
                messages: [`MapView entered, register store mutation watcher`],
            })
            const appStore = useAppStore()

            /**
             * We subscribe to every store we need to in order to sync the URL and the
             * state of the application.
             *
             */
            function applyAllPersistentSubscriptions(): void {

                function setSubscription(store: Store): () => void {
                    return store.$onAction(({after, name, args}) => {
                        after(() => storeMutationWatcher(name, args, router))
                    })
                }

                unsubscribeCesiumMutation = setSubscription(useCesiumStore())
                unsubscribeDebugMutation = setSubscription(useDebugStore())
                unsubscribeGeolocationMutation = setSubscription(useGeolocationStore())
                unsubscribeI18nMutation = setSubscription(useI18nStore())
                unsubscribeLayerMutation = setSubscription(useLayersStore())
                unsubscribePositionMutation = setSubscription(usePositionStore())
                unsubscribePrintMutation = setSubscription(usePrintStore())
                unsubscribeSearchMutation = setSubscription(useSearchStore())
                unsubscribeTopicMutation = setSubscription(useTopicsStore())
                unsubscribeUIMutation = setSubscription(useUIStore())
            }

            // we are waiting for the app to be ready to start listening on the store changes for the URL sync
            unsubscribeAppReadyMutation = appStore.$onAction(({ after, name, args }) => {

                after(() => {
                    if (name === 'setAppIsReady') {
                    // If the app was not yet ready after entering the map view, we need to
                    // trigger the initial urlQuery watcher otherwise we have a blank application.
                    log.info({
                        title: 'Router store plugin/afterEach',
                        titleColor: LogPreDefinedColor.Rose,
                        messages: [`App is ready, trigger initial URL query watcher`],
                    })
                    applyAllPersistentSubscriptions()
                    initialUrlQueryWatcher(to, router)
                } else if (appStore.isReady) {
                    // here, we need to set up the store mutation watcher for all stores.

                    applyAllPersistentSubscriptions()
                    storeMutationWatcher(name, args, router)

                }
                })

            })

            if (appStore.isReady) {
                // After entering for the first time the map view, if the app is already ready that
                // mean that the initial URL query watcher was not run yet and we need to do it
                // otherwise the query parameter will not have any effect on the application leaving
                // it blank until a reload or a user action (e.g. adding a layer)
                log.warn({
                    title: 'Router store plugin/afterEach',
                    titleColor: LogPreDefinedColor.Rose,
                    messages: [
                        `MapView entered, while app was already ready ! Trigger initial URL query watcher`,
                    ],
                })
                applyAllPersistentSubscriptions()
                initialUrlQueryWatcher(to, router)
            }
        }
    })
}

export default storeSyncRouterPlugin
