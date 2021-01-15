const routerAppLoadingManagement = (router, store) => {
  let wantedDestination = null
  // checking if app is ready, if not keeping track of the first destination and redirect to loading splashscreen
  router.beforeEach((to, from, next) => {
    // if app is ready we keep the route going
    if (store.state.app.isReady) {
      next()
    } else {
      if (to.name === 'LoadingView') {
        if (!wantedDestination) {
          wantedDestination = {
            name: 'MapView',
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

export default routerAppLoadingManagement
