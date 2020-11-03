import { stateToParamsExtractor } from "./store-to-url-management";

const routerAppLoadingManagement = (router, store) => {
    let wantedDestination = null;
    // checking if app is ready, if not keeping track of the first destination and redirect to loading splashscreen
    router.beforeEach((to, from, next) => {
        // if app is ready we keep the route going
        if (store.state.app.isReady) {
            next()
        } else {
            // if app is not ready, we redirect to loading splashscreen while keeping track of the wanted destination
            if (!wantedDestination) {
                wantedDestination = to;
            }
            if (to.name === 'LoadingView') {
                next()
            } else {
                next({
                    name: 'LoadingView'
                });
            }
        }
    });

    store.subscribe((mutation) => {
    // listening to the store for the "Go" when the app is ready
        if (mutation.type === 'setAppIsReady') {
            // if lat lon and zoom are not present in the destination, we add them before going to it
            if (Object.keys(wantedDestination.params).length === 0) {
                const params = stateToParamsExtractor(store);
                Object.keys(params).forEach(param => {
                    wantedDestination.params[param] = params[param];
                })
            }
            router.push({
                name: 'MapView',
                params: {
                    ...wantedDestination.params
                },
                query: {
                    ...wantedDestination.query
                }
            }).then(() => {
                wantedDestination = null;
            });
        }
    })
}

export default routerAppLoadingManagement;
