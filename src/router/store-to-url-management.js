import storeToUrlManagementConfig from '@/router/store-to-url-management.config'
import log from '@/utils/logging'

const watchedMutations = [
    ...new Set(
        storeToUrlManagementConfig
            .map((paramConfig) => paramConfig.mutationsToWatch.split(','))
            .flat()
    ),
]

/**
 * Checks all param in the current route and the store to see if there's a difference in values
 *
 * @param {Vuex.Store} store
 * @param {RouterLink} currentRoute
 * @returns {boolean} True if a value is different between the store and the URL
 */
const isRoutePushNeeded = (store, currentRoute) => {
    let aRoutePushIsNeeded = false
    storeToUrlManagementConfig.forEach(
        (paramConfig) =>
            (aRoutePushIsNeeded ||= paramConfig.valuesAreDifferentBetweenQueryAndStore(
                currentRoute.query,
                store
            ))
    )
    return aRoutePushIsNeeded
}

const pendingMutationTriggeredByThisModule = []

/**
 * Plugin that syncs what is in the URL with what is in the store (and vice-versa). It also reacts
 * to on-the-fly changes in the URL and commit the changes to the store.
 *
 * @param {VueRouter} router
 * @param {Vuex.Store} store
 */
const storeToUrlManagement = (router, store) => {
    // flag to distinguish URL change originated by this module or by another source
    let routeChangeIsTriggeredByThisModule = false
    // listening to store mutation in order to update URL
    store.subscribe((mutation) => {
        // if this mutation has been triggered by router.beforeEach below, we ignore it
        if (
            pendingMutationTriggeredByThisModule.indexOf(mutation.type) === -1 &&
            watchedMutations.includes(mutation.type)
        ) {
            // if the value in the store differs from the one in the URL
            if (isRoutePushNeeded(store, router.currentRoute)) {
                routeChangeIsTriggeredByThisModule = true
                const query = {}
                // extracting all param from the store
                storeToUrlManagementConfig.forEach((paramConfig) =>
                    paramConfig.populateQueryWithStoreValue(query, store)
                )
                router.replace({
                    name: 'MapView',
                    query,
                })
            }
        }
    })
    // listening to URL change (independent of this module) in order to update the store
    router.beforeEach((to, _, next) => {
        if (routeChangeIsTriggeredByThisModule) {
            routeChangeIsTriggeredByThisModule = false
        } else if (store.state.app.isReady) {
            // if the route change is not made by this module we need to check if a store change is needed
            storeToUrlManagementConfig.forEach((paramConfig) => {
                const queryValue = paramConfig.readValueFromQuery(to.query)
                if (
                    queryValue &&
                    paramConfig.valuesAreDifferentBetweenQueryAndStore(to.query, store)
                ) {
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
                        queryValue,
                        '(dispatching to:',
                        paramConfig.dispatchChangeTo,
                        ')'
                    )
                    store.dispatch(paramConfig.dispatchChangeTo, queryValue).then(() => {
                        // removing mutation name from the pending ones
                        pendingMutationTriggeredByThisModule.splice(
                            pendingMutationTriggeredByThisModule.indexOf(
                                paramConfig.dispatchChangeTo
                            ),
                            1
                        )
                    })
                }
            })
        }
        next()
    })
}

export default storeToUrlManagement
