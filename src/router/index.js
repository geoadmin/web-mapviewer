import Vue from 'vue'
import VueRouter from 'vue-router'

import MapView from '@/views/MapView'
import LoadingView from '@/views/LoadingView'
import store from '@/modules/store'

import appLoadingManagementRouterPlugin from './appLoadingManagement.routerPlugin'
import storeSyncRouterPlugin from './storeSync/storeSync.routerPlugin'
import legacyPermalinkManagementRouterPlugin from './legacyPermalinkManagement.routerPlugin'
import stringifyQuery from '@/router/stringifyQuery'

Vue.use(VueRouter)

const routes = [
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
]

/**
 * The Vue Router for this app, see [Vue Router's doc on how to use it]{@link https://router.vuejs.org/guide/}
 *
 * @type {VueRouter}
 */
const router = new VueRouter({
    routes,
    stringifyQuery: stringifyQuery,
})

appLoadingManagementRouterPlugin(router, store)
storeSyncRouterPlugin(router, store)
legacyPermalinkManagementRouterPlugin(router)

export default router
