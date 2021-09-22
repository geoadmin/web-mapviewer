import { createRouter, createWebHistory } from 'vue-router'

import MapView from '@/views/MapView'
import LoadingView from '@/views/LoadingView'
import store from '@/modules/store'

import appLoadingManagementRouterPlugin from './appLoadingManagement.routerPlugin'
import storeSyncRouterPlugin from './storeSync/storeSync.routerPlugin'
import legacyPermalinkManagementRouterPlugin from './legacyPermalinkManagement.routerPlugin'
import stringifyQuery from '@/router/stringifyQuery'

/**
 * The Vue Router for this app, see [Vue Router's doc on how to use it]{@link https://router.vuejs.org/guide/}
 *
 * @type {Router}
 */
const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            redirect: { name: 'LoadingView' },
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
        },
    ],
    // we add a custom stringifier so that the `layers=` param is left untouched by the URL encoder
    stringifyQuery: stringifyQuery,
})

appLoadingManagementRouterPlugin(router, store)
storeSyncRouterPlugin(router, store)
legacyPermalinkManagementRouterPlugin(router, store)

export default router
