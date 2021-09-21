/**
 * Listen to the store and wait for a certain set of conditions to be fulfilled. It then triggers
 * change of route, going to the map view, telling the app it can show the map and all other
 * associated UI elements.
 *
 * What we are waiting for is :
 *
 * - Layers config to be loaded (so we have all layers definition/metadata)
 * - We know the size of the viewport (so by definition the resolution of the map)
 *
 * See the Vuex "sister" plugin {@link appReadinessPlugin} for more information
 *
 * @param {Router} router
 * @param {Store} store
 */
const appLoadingManagementRouterPlugin = (router, store) => {
    let wantedDestination = null
    // Checking if app is ready.
    // If not, keeping track of the first destination and redirect to loading splashscreen
    router.beforeEach((to, from, next) => {
        // if app is ready we keep the route going
        if (store.state.app.isReady) {
            next()
        } else {
            if (to.name === 'LoadingView') {
                if (!wantedDestination) {
                    wantedDestination = {
                        name: 'MapView',
                        query: to.query,
                    }
                }
                next()
            } else {
                // if app is not ready, we redirect to loading screen while keeping track of the last wanted destination
                wantedDestination = to
                next({
                    name: 'LoadingView',
                })
            }
        }
    })

    store.subscribe((mutation) => {
        // listening to the store for the "Go" when the app is ready
        if (mutation.type === 'setAppIsReady') {
            let query = {}
            if (wantedDestination && wantedDestination.query) {
                query = { ...wantedDestination.query }
            }
            router
                .push({
                    name: 'MapView',
                    query,
                })
                .then(() => {
                    wantedDestination = null
                })
        }
    })
}

export default appLoadingManagementRouterPlugin
