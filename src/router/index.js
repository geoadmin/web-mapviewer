import { createRouter, createWebHashHistory } from 'vue-router'

import { IS_TESTING_WITH_CYPRESS } from '@/config'
import appLoadingManagementRouterPlugin from '@/router/appLoadingManagement.routerPlugin'
import legacyPermalinkManagementRouterPlugin from '@/router/legacyPermalinkManagement.routerPlugin'
import storeSyncRouterPlugin from '@/router/storeSync/storeSync.routerPlugin'
import store from '@/store'
import { parseQuery, stringifyQuery } from '@/utils/url-router'
import LoadingView from '@/views/LoadingView.vue'
import MapView from '@/views/MapView.vue'

const history = createWebHashHistory()

/**
 * The Vue Router for this app, see [Vue Router's doc on how to use
 * it]{@link https://router.vuejs.org/guide/}
 *
 * @type {Router}
 */
const router = createRouter({
    history,
    routes: [
        {
            path: '/',
            redirect: { name: 'MapView' },
        },
        {
            path: '/startup',
            name: 'LoadingView',
            component: LoadingView,
        },
        {
            path: '/map',
            name: 'MapView',
            component: MapView,
            meta: {
                requiresAppReady: true,
            },
        },
    ],
    parseQuery: parseQuery,
    stringifyQuery: stringifyQuery,
})

appLoadingManagementRouterPlugin(router, store)
legacyPermalinkManagementRouterPlugin(router, store)
storeSyncRouterPlugin(router, store)

// exposing the router to Cypress, so that we may change URL param on the fly (without app reload),
// and this way test app reaction to URL changes
if (IS_TESTING_WITH_CYPRESS) {
    window.vueRouterHistory = history
    window.vueRouter = router
}
export default router
