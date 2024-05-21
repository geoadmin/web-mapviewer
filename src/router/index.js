import { createRouter, createWebHashHistory } from 'vue-router'

import { IS_TESTING_WITH_CYPRESS } from '@/config'
import appLoadingManagementRouterPlugin from '@/router/appLoadingManagement.routerPlugin'
import legacyPermalinkManagementRouterPlugin from '@/router/legacyPermalinkManagement.routerPlugin'
import storeSyncRouterPlugin from '@/router/storeSync/storeSync.routerPlugin'
import {
    EMBED_VIEW,
    LEGACY_EMBED_PARAM_VIEW,
    LEGACY_PARAM_VIEW,
    MAP_VIEW,
} from '@/router/viewNames'
import store from '@/store'
import log from '@/utils/logging'
import { parseQuery, stringifyQuery } from '@/utils/url-router'
import EmbedView from '@/views/EmbedView.vue'
import LegacyParamsView from '@/views/LegacyParamsView.vue'
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
            redirect: { name: MAP_VIEW },
        },
        {
            path: '/map',
            name: MAP_VIEW,
            component: MapView,
            meta: {
                requiresAppReady: true,
            },
        },
        {
            path: '/embed',
            name: EMBED_VIEW,
            component: EmbedView,
            meta: {
                requiresAppReady: true,
            },
        },
        {
            path: '/legacy',
            name: LEGACY_PARAM_VIEW,
            component: LegacyParamsView,
            meta: {
                requiresAppReady: true,
            },
        },
        {
            path: '/legacy-embed',
            name: LEGACY_EMBED_PARAM_VIEW,
            component: LegacyParamsView,
            props: { embed: true },
            meta: {
                requiresAppReady: true,
            },
        },
    ],
    parseQuery: parseQuery,
    stringifyQuery: stringifyQuery,
})

router.onError((error) => {
    log.error(error)
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
