import log from '@/utils/logging'
import { getUrlQuery } from '@/utils/utils'

const dispatcher = { dispatcher: 'appLoadingManagement.routerPlugin' }

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
        if (to.meta.requireAppConfig && !store.state.app.isConfigReady) {
            // Upon application startup we need to first get the language and
            // topic from the URL in order to quickly load the layers config and
            // topics. We do this as early as possible as we need topics and config to define
            // the default application state.
            const queryParams = getUrlQuery()
            const lang = queryParams.get('lang') ?? store.state.i18n.lang
            const topic = queryParams.get('topic') ?? store.state.topics.current
            store.dispatch('changeTopic', {
                topicId: topic,
                ...dispatcher,
            })
            store.dispatch('setLang', {
                lang: lang,
                ...dispatcher,
            })
            log.debug(`App is not ready redirect to /#/startup?redirect=${to.fullPath}`)
            return { name: 'LoadingView', query: { redirect: to.fullPath }, replace: true }
        }
        return
    })

    const unSubscribeStore = store.subscribe((mutation) => {
        // listening to the store for the "Go" when the app is ready
        if (mutation.type === 'setConfigIsReady') {
            unRegisterRouterHook()
            unSubscribeStore()
            const redirect = router.currentRoute.value.query.redirect || '/map'
            log.info('App is ready redirect to ', redirect)
            router.replace(redirect)
        }
    })
}

export default appLoadingManagementRouterPlugin
