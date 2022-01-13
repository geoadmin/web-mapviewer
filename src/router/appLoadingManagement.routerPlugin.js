import log from '@/utils/logging'

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
    const unRegisterRouterHook = router.beforeEach((to) => {
        if (to.meta.requiresAppReady && !store.state.app.isReady) {
            log('debug', `App is not ready redirect to /#/startup?redirect=${to.fullPath}`)
            return { name: 'LoadingView', query: { redirect: to.fullPath }, replace: true }
        }
        return
    })

    const unSubscribeStore = store.subscribe((mutation) => {
        // listening to the store for the "Go" when the app is ready
        if (mutation.type === 'setAppIsReady') {
            unRegisterRouterHook()
            unSubscribeStore()
            const redirect = router.currentRoute.value.query.redirect || '/map'
            log('info', 'App is ready redirect to ', redirect)
            router.replace(redirect)
        }
    })
}

export default appLoadingManagementRouterPlugin
