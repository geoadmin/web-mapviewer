/**
 * Extracts the param part of routes from the Vuex's store
 *
 * @returns {{lon: Number, zoom: Number, lat: Number}} params for routes
 */
export const stateToParamsExtractor = (store) => {
    const [ lon, lat ] = store.getters.centerEpsg4326;
    const zoom = store.getters.zoom;
    return {
        lat, lon, zoom
    }
}

const urlParamsConfig = {
    'lat': {
        mutationToWatch: 'setExtent',
        dispatchChangeTo: 'setLatitude',
        extractValueFromStore: store => store.getters.centerEpsg4326[1],
        type: Number,
        isRouteParam: true,
    },
    'lon': {
        mutationToWatch: 'setExtent',
        dispatchChangeTo: 'setLongitude',
        extractValueFromStore: store => store.getters.centerEpsg4326[0],
        type: Number,
        isRouteParam: true,
    },
    'zoom': {
        mutationToWatch: 'setExtent',
        dispatchChangeTo: 'setZoom',
        extractValueFromStore: store => store.getters.zoom,
        type: Number,
        isRouteParam: true,
    }
}
const watchedMutations = [...new Set(Object.keys(urlParamsConfig).map(param => urlParamsConfig[param].mutationToWatch))];

const isRoutePushNeeded = (store, currentRoute) => {
    let aRoutePushIsNeeded = false;
    Object.keys(urlParamsConfig).forEach(param => {
        const paramConfig = urlParamsConfig[param];
        const paramValueInStore = paramConfig.type(paramConfig.extractValueFromStore(store));
        const paramValueInURL = paramConfig.type(paramConfig.isRouteParam ? currentRoute.params[param] : currentRoute.query[param]);
        aRoutePushIsNeeded |= paramValueInStore !== paramValueInURL;
    })
    return aRoutePushIsNeeded;
}

const storeToUrlManagement = (router, store) => {
    // flag to distinguish URL change originated by this module or by another source
    let routeChangeIsTriggeredByThisModule = false;
    // listening to store mutation in order to update URL
    store.subscribe((mutation) => {
        if (watchedMutations.includes(mutation.type)) {
            // const config = watchedMutations[mutation.type];
            const params = stateToParamsExtractor(store);
            if (isRoutePushNeeded(store, router.currentRoute)) {
                routeChangeIsTriggeredByThisModule = true;
                router.push({
                    name: 'MapView',
                    params,
                });
            }
        }
    });
    // listening to URL change (independent of this module) in order to update the store
    router.beforeEach((to, _, next) => {
        if (routeChangeIsTriggeredByThisModule) {
            routeChangeIsTriggeredByThisModule = false;
        } else if (store.state.app.isReady) {
            // if the route change is not made by this module we need to check if a store change is needed
            Object.keys(urlParamsConfig).forEach(param => {
                const paramConfig = urlParamsConfig[param];
                const storeValue = paramConfig.type(paramConfig.extractValueFromStore(store));
                const urlValue = paramConfig.type(paramConfig.isRouteParam ? to.params[param] : to.query[param]);
                if (storeValue !== urlValue) {
                    store.dispatch(paramConfig.dispatchChangeTo, urlValue);
                }
            })
        }
        next();
    })
}

export default storeToUrlManagement;
