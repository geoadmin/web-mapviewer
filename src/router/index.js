import { createRouter, createWebHashHistory } from 'vue-router'

import MapView from '@/views/MapView.vue'
import LoadingView from '@/views/LoadingView.vue'
import store from '@/store'

import appLoadingManagementRouterPlugin from '@/router/appLoadingManagement.routerPlugin'
import storeSyncRouterPlugin from '@/router/storeSync/storeSync.routerPlugin'
import legacyPermalinkManagementRouterPlugin from '@/router/legacyPermalinkManagement.routerPlugin'
import stringifyQuery from '@/router/stringifyQuery'

/**
 * The Vue Router for this app, see [Vue Router's doc on how to use it]{@link https://router.vuejs.org/guide/}
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
    // we add a custom stringifier so that the `layers=` param is left untouched by the URL encoder
    stringifyQuery: stringifyQuery,
})

appLoadingManagementRouterPlugin(router, store)
legacyPermalinkManagementRouterPlugin(router, store)
storeSyncRouterPlugin(router, store)

export default router
