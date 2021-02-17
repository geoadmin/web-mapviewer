import Vue from 'vue'
import VueRouter from 'vue-router'
import MapView from '@/views/MapView'
import LoadingView from '@/views/LoadingView'
import store from '@/modules/store'

import routerAppLoadingManagement from './router-app-loading-management'
import storeToUrlManagement from './store-to-url-management'
import legacyPermalinkManagement from './legacy-permalink-management'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        redirect: { name: 'LoadingView' },
    },
    // TODO: remove the loading view and make it a UI loading bar or other feedback under the header (while showing the map without tiles)
    {
        path: '/loading',
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
})

routerAppLoadingManagement(router, store)
storeToUrlManagement(router, store)
legacyPermalinkManagement(router)

export default router
