import log from '@swissgeo/log'
import { createRouter, createWebHashHistory, type Router } from 'vue-router'

import { IS_TESTING_WITH_CYPRESS } from '@/config/staging.config'
import appReadinessRouterPlugin from '@/router/appReadiness.routerPlugin'
import legacyPermalinkRouterPlugin from '@/router/legacyPermalink.routerPlugin'
import {
    EMBED_VIEW,
    LEGACY_EMBED_PARAM_VIEW,
    LEGACY_PARAM_VIEW,
    MAP_VIEW,
    PRINT_VIEW,
} from '@/router/viewNames'
import { parseQuery, stringifyQuery } from '@/utils/url-router'
import EmbedView from '@/views/EmbedView.vue'
import LegacyParamsView from '@/views/LegacyParamsView.vue'
import MapView from '@/views/MapView.vue'
import PrintView from '@/views/PrintView.vue'
import storeSyncRouterPlugin from '@/router/storeSync'

const history = createWebHashHistory()

/**
 * The Vue Router for this app, see [Vue Router's doc on how to use
 * it]{@link https://router.vuejs.org/guide/}
 */
const router: Router = createRouter({
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
            path: '/print',
            name: PRINT_VIEW,
            component: PrintView,
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
    log.error('[Router error] :', error)
})

// exposing the router to Cypress, so that we may change URL param on the fly (without app reload),
// and this way test app reaction to URL changes
if (IS_TESTING_WITH_CYPRESS) {
    window.vueRouterHistory = history
    window.vueRouter = router
}

appReadinessRouterPlugin(router)
legacyPermalinkRouterPlugin(router)
// WIP on it to make it work again, disabling it in the meantime
storeSyncRouterPlugin(router)

export default router
