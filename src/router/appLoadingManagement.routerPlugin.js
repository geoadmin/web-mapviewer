import { START_LOCATION } from 'vue-router'

import { isLegacyParams } from '@/utils/legacyLayerParamUtils'
import log from '@/utils/logging'

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
    if (!store.state.app.isReady) {
        const isLegacyUrl = isLegacyParams(window?.location?.search)

        const unRegisterRouterHook = router.beforeEach((to, from) => {
            if (from === START_LOCATION && to.meta.requiresAppReady) {
                // Upon application startup we need to first get the language and
                // topic from the URL in order to quickly load the layers config and
                // topics. We do this as early as possible as we need topics and config to define
                // the default application state.
                const queryParams = to.query ?? {}
                const lang = queryParams.lang ?? store.state.i18n.lang
                const topic = queryParams.topic ?? store.state.topics.current
                log.info(
                    `App is not ready dispatching lang=${lang} and topic=${topic} (isLegacy=${isLegacyUrl})`,
                    to,
                    from
                )
                store.dispatch('changeTopic', {
                    topicId: topic,
                    ...dispatcher,
                })
                store.dispatch('setLang', {
                    lang: lang,
                    isLegacyUrl,
                    ...dispatcher,
                })
                unRegisterRouterHook()
            }
        })
        const unSubscribeStore = store.subscribe((mutation) => {
            // listening to the store for the "Go" when the app is ready
            if (mutation.type === 'setAppIsReady') {
                unSubscribeStore()
                log.info('App is ready, unregister app loading management plugin')
            }
        })
    }
}

export default appLoadingManagementRouterPlugin
