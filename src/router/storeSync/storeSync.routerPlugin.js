import storeSyncConfig from '@/router/storeSync/storeSync.config'
import log from '@/utils/logging'

const watchedMutations = [
    ...new Set(
        storeSyncConfig.map((paramConfig) => paramConfig.mutationsToWatch.split(',')).flat()
    ),
]

const mutationNotTriggeredByModule = (mutation) =>
    pendingMutationTriggeredByThisModule.indexOf(mutation.type) === -1
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
            (aRoutePushIsNeeded ||= paramConfig.valuesAreDifferentBetweenQueryAndStore(
                currentRoute.query,
                store
            ))
    )
    return aRoutePushIsNeeded
}

// flag to distinguish URL change originated by this module or by another source
const pendingMutationTriggeredByThisModule = []
let routeChangeIsTriggeredByThisModule = false

/**
 * Watch for store changes and reflect the changes in the URL query param if needed
 *
 * @param {Store} store
 * @param {Mutation} mutation
 * @param {Router} router
 */
function storeMutationWatcher(store, mutation, router) {
    log.debug('Store mutation', mutation, 'Current route', router.currentRoute.value)

    // Ignore mutation that has been triggered by the router.beforeEach below.
    if (mutationNotTriggeredByModule(mutation) && mutationWatched(mutation)) {
        // if the value in the store differs from the one in the URL
        if (isRoutePushNeeded(store, router.currentRoute.value)) {
            const query = {}
            // extracting all param from the store
            storeSyncConfig.forEach((paramConfig) =>
                paramConfig.populateQueryWithStoreValue(query, store)
            )
            log.info('Store has changed, rerouting app to query', query)
            routeChangeIsTriggeredByThisModule = true
            router
                .push({
                    name: 'MapView',
                    query,
                })
                .catch((error) => {
                    log.info('Error while routing to', query, error)
                    routeChangeIsTriggeredByThisModule = false
                })
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
 *   query changes), false to cancel the navigation or RouteLocationRaw to change url query parameter.
 */
function urlQueryWatcher(store, to) {
    log.debug('Url query watcher', routeChangeIsTriggeredByThisModule, to)
    if (routeChangeIsTriggeredByThisModule) {
        // Only sync route params when the route change has not been
        // triggered by the sync from store mutations watcher above.
        routeChangeIsTriggeredByThisModule = false
        return undefined
    }
    let requireQueryUpdate = false
    const newQuery = Object.assign({}, to.query)
    // if the route change is not made by this module we need to check if a store change is needed
    storeSyncConfig.forEach((paramConfig) => {
        const queryValue = paramConfig.readValueFromQuery(to.query)
        const storeValue = paramConfig.readValueFromStore(store)
        if (queryValue && queryValue !== storeValue) {
            // preventing store.subscribe above to change what is in the URL while dispatching this change
            // if we don't ignore this next mutation, all other param than the one treated here could go back
            // to default/store value even though they could be defined differently in the URL.
            pendingMutationTriggeredByThisModule.push(paramConfig.mutationsToWatch)
            // dispatching URL value to the store
            log(
                'debug',
                'dispatching URL param',
                paramConfig.urlParamName,
                'to store with value',
                queryValue
            )
            paramConfig.populateStoreWithQueryValue(store, queryValue).then(() => {
                // removing mutation name from the pending ones
                pendingMutationTriggeredByThisModule.splice(
                    pendingMutationTriggeredByThisModule.indexOf(paramConfig.mutationsToWatch),
                    1
                )
            })
        } else if (!queryValue && storeValue) {
            // if we don't have a query value but a store value update the url query with it
            newQuery[paramConfig.urlParamName] = storeValue
            requireQueryUpdate = true
        }
    })
    if (requireQueryUpdate) {
        log.debug('Update URL query to', newQuery)
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
    router.beforeEach((to, from) => {
        if (to.name === 'MapView' && from.name !== to.name) {
            log.debug('Entering MapView, register store mutation watcher')
            // listening to store mutation in order to update URL
            unsubscribeStoreMutation = store.subscribe((mutation) =>
                storeMutationWatcher(store, mutation, router)
            )
        } else if (to.name !== 'MapView') {
            // leaving MapView make sure to unsubscribe the store mutation
            if (unsubscribeStoreMutation) {
                unsubscribeStoreMutation()
            }
        }

        if (to.name === 'MapView') {
            // When on the MapView synchronize the store with the url query
            return urlQueryWatcher(store, to)
        }
        // Note we return undefined to validate the route, see Vue Router documentation
        return undefined
    })
}

export default storeSyncRouterPlugin
