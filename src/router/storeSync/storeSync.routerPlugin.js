import axios from 'axios'

import { IS_TESTING_WITH_CYPRESS } from '@/config'
import { STORE_DISPATCHER_ROUTER_PLUGIN } from '@/router/storeSync/abstractParamConfig.class'
import storeSyncConfig from '@/router/storeSync/storeSync.config'
import log from '@/utils/logging'

export const FAKE_URL_CALLED_AFTER_ROUTE_CHANGE = '/tell-cypress-route-has-changed'

const watchedMutations = [
    ...new Set(
        storeSyncConfig.map((paramConfig) => paramConfig.mutationsToWatch.split(',')).flat()
    ),
]

const mutationNotTriggeredByModule = (mutation) =>
    mutation.payload.dispatcher !== STORE_DISPATCHER_ROUTER_PLUGIN
const mutationWatched = (mutation) => watchedMutations.includes(mutation.type)

/**
 * Checks all param in the current route and the store to see if there's a difference in values
 *
 * @param {Store} store
 * @param {RouterLink} currentRoute
 * @returns {boolean} True if a value is different between the store and the URL
 */

const isRoutePushNeeded = (store, currentRoute) => {
    let aRoutePushIsNeeded = false
    storeSyncConfig.forEach(
        (paramConfig) =>
            aRoutePushIsNeeded ||
            (aRoutePushIsNeeded = paramConfig.valuesAreDifferentBetweenQueryAndStore(
                currentRoute.query,
                store
            ))
    )
    return aRoutePushIsNeeded
}

// flag to distinguish URL change originated by this module or by another source
let routeChangeIsTriggeredByThisModule = false

/**
 * Watch for store changes and reflect the changes in the URL query param if needed
 *
 * @param {Store} store
 * @param {Mutation} mutation
 * @param {Router} router
 */
function storeMutationWatcher(store, mutation, router) {
    // Ignore mutation that has been triggered by the router plugin
    if (mutationNotTriggeredByModule(mutation) && mutationWatched(mutation)) {
        log.debug(
            '[store sync router] store mutation',
            mutation,
            'Current route',
            router.currentRoute.value
        )

        // if the value in the store differs from the one in the URL
        if (isRoutePushNeeded(store, router.currentRoute.value)) {
            const query = {}
            // extracting all param from the store
            storeSyncConfig.forEach((paramConfig) =>
                paramConfig.populateQueryWithStoreValue(query, store)
            )
            log.info('[store sync router] Store has changed, rerouting app to query', query)
            routeChangeIsTriggeredByThisModule = true
            router
                .push({
                    name: 'MapView',
                    query,
                })
                .catch((error) => {
                    log.error('Error while routing to', query, error)
                })
                .finally(() => {
                    routeChangeIsTriggeredByThisModule = false
                })
            // if the short linked version of the URL is already defined,
            // and the share menu opened, we must close the share menu and
            // reset the shortlink
            if (store.state.share.shortLink) {
                store.dispatch('closeShareMenuAndRemoveShortLinks', {
                    dispatcher: STORE_DISPATCHER_ROUTER_PLUGIN,
                })
            }
        }
    }
}

/**
 * Watch for URL query parameter changes and sync the store if needed.
 *
 * Also add missing URL query parameter with default value (store value).
 *
 * @param {Store} store
 * @param {RouteLocationNormalized} to
 * @returns {undefined | false | RouteLocationRaw} Returns undefined to validate the navigation (no
 *   query changes), false to cancel the navigation or RouteLocationRaw to change url query
 *   parameter.
 */
function urlQueryWatcher(store, to) {
    if (routeChangeIsTriggeredByThisModule) {
        log.debug(`[Router store plugin] Url query watcher triggered by itself ignore it`, to)
        // Only sync route params when the route change has not been
        // triggered by the sync from store mutations watcher above.
        routeChangeIsTriggeredByThisModule = false
        return undefined
    }
    log.debug(`[URL query watcher]`, to.query)
    const pendingStoreDispatch = []
    let requireQueryUpdate = false
    const newQuery = { ...to.query }
    // if this module did not trigger the route change, we need to check if a store change is needed
    storeSyncConfig.forEach((paramConfig) => {
        const queryValue = paramConfig.readValueFromQuery(to.query)
        const storeValue = paramConfig.readValueFromStore(store)

        const setValueInStore = async (paramConfig, store, value) => {
            await paramConfig.populateStoreWithQueryValue(store, value)
        }

        if (queryValue && queryValue !== storeValue) {
            // dispatching URL value to the store
            log.debug(
                '[URL query watcher] param',
                paramConfig.urlParamName,
                ': dispatching to store with value',
                queryValue
            )
            pendingStoreDispatch.push(setValueInStore(paramConfig, store, queryValue))
        } else if (!queryValue && storeValue) {
            if (paramConfig.keepInUrlWhenDefault) {
                // if we don't have a query value but a store value update the url query with it
                log.debug(
                    '[URL query watcher] param',
                    paramConfig.urlParamName,
                    ': was not present in URL, setting it back with value',
                    storeValue
                )
                newQuery[paramConfig.urlParamName] = storeValue
            } else {
                // if the query value has been removed (or set to false for a Boolean) and is meant to disappear from
                // the URL with this value, we set it to a falsy value in the store and remove it from the URL
                log.debug(
                    '[URL query watcher] param',
                    paramConfig.urlParamName,
                    ': has been removed from the URL, setting it to falsy value in the store'
                )
                pendingStoreDispatch.push(
                    setValueInStore(
                        paramConfig,
                        store,
                        paramConfig.valueType === Boolean ? false : null
                    )
                )
                delete newQuery[paramConfig.urlParamName]
            }
            requireQueryUpdate = true
        }
    })
    // Fake call to a URL so that Cypress can wait for route changes without waiting for arbitrary length of time
    if (IS_TESTING_WITH_CYPRESS) {
        Promise.all(pendingStoreDispatch).then(() => {
            axios({
                url: FAKE_URL_CALLED_AFTER_ROUTE_CHANGE,
            })
        })
    }
    if (requireQueryUpdate) {
        log.debug('[URL query watcher] Update URL query to', newQuery)
        // NOTE: this rewrite of query currently don't work when navigating manually got the `/#/`
        // URL. This should actually change the url to `/#/map?...` with the correct query, but it
        // stays on `/#/`. When manually chaning any query param it works though.
        return { name: 'MapView', query: newQuery }
    }
    return undefined
}

/**
 * Plugin that syncs what is in the URL with what is in the store (and vice-versa). It also reacts
 * to on-the-fly changes in the URL and commit the changes to the store.
 *
 * NOTE: This plugin subscribe on store mutation only when on the MapView because we don't want to
 * change the url when the app is not on the MapView. The store is also only updated with the query
 * parameter when on the MapView.
 *
 * @param {Router} router
 * @param {Store} store
 */
const storeSyncRouterPlugin = (router, store) => {
    let unsubscribeStoreMutation = null
    router.beforeEach((to) => {
        if (to.name === 'MapView' && !unsubscribeStoreMutation) {
            log.info('[Router store plugin] Entering MapView, register store mutation watcher')
            // listening to store mutation in order to update URL
            unsubscribeStoreMutation = store.subscribe((mutation) => {
                if (mutation.type === 'setAppIsReady') {
                    log.info(
                        '[Router store plugin] app is ready, trigger initial URL query watcher'
                    )
                    const newRoute = urlQueryWatcher(store, to)
                    if (newRoute) {
                        router.push(newRoute)
                    }
                } else if (store.state.app.isReady) {
                    storeMutationWatcher(store, mutation, router)
                }
            })
        } else if (to.name !== 'MapView') {
            // leaving MapView make sure to unsubscribe the store mutation
            if (unsubscribeStoreMutation) {
                log.info('[Router store plugin] Leaving MapView, unregister store mutation watcher')
                unsubscribeStoreMutation()
            }
        }

        if (to.name === 'MapView' && store.state.app.isReady) {
            // Synchronize the store with the url query only on MapView and when the application
            // is ready
            return urlQueryWatcher(store, to)
        }
        // Note we return undefined to validate the route, see Vue Router documentation
        return undefined
    })
}

export default storeSyncRouterPlugin
