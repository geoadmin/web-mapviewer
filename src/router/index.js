import Vue from 'vue'
import VueRouter from 'vue-router'

import MapView from '@/views/MapView'
import store from '@/modules/store'

import appLoadingManagementRouterPlugin from './appLoadingManagement.routerPlugin'
import storeSyncRouterPlugin from './storeSync/storeSync.routerPlugin'
import legacyPermalinkManagementRouterPlugin from './legacyPermalinkManagement.routerPlugin'
import stringifyQuery from '@/router/stringifyQuery'

// copy pasted from https://github.com/vuejs/vue-router/issues/2881#issuecomment-520554378
// in order to suppress errors when using navigation guards for URL param management (it makes the
// E2E tests fail)
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location, onResolve, onReject) {
    if (onResolve || onReject) {
        return originalPush.call(this, location, onResolve, onReject)
    }
    return originalPush.call(this, location).catch((err) => {
        if (VueRouter.isNavigationFailure(err)) {
            // resolve err
            return err
        }
        // rethrow error
        return Promise.reject(err)
    })
}

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
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
    // we add a custom stringifier so that the `layers=` param is left untouched by the URL encoder
    stringifyQuery: stringifyQuery,
})

appLoadingManagementRouterPlugin(router, store)
storeSyncRouterPlugin(router, store)
legacyPermalinkManagementRouterPlugin(router, store)

export default router
