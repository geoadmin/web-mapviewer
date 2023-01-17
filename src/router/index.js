import appLoadingManagementRouterPlugin from '@/router/appLoadingManagement.routerPlugin'
import legacyPermalinkManagementRouterPlugin from '@/router/legacyPermalinkManagement.routerPlugin'
import storeSyncRouterPlugin from '@/router/storeSync/storeSync.routerPlugin'
import store from '@/store'
import LoadingView from '@/views/LoadingView.vue'
import { parseQuery, stringifyQuery } from '@/utils/url'

import MapView from '@/views/MapView.vue'
import { createRouter, createWebHashHistory } from 'vue-router'

/**
 * The Vue Router for this app, see [Vue Router's doc on how to use
 * it]{@link https://router.vuejs.org/guide/}
 *
 * @type {Router}
 */
const router = createRouter({
    history: createWebHashHistory(),
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

export default router
