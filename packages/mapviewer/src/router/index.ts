import type { Router } from 'vue-router'

import log, { LogPreDefinedColor } from '@swissgeo/log'
import {
    createRouter,
    createWebHashHistory,
    isNavigationFailure,
    NavigationFailureType,
} from 'vue-router'

import { IS_TESTING_WITH_CYPRESS } from '@/config'
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

router.afterEach((to, from, failure) => {
    if (isNavigationFailure(failure, NavigationFailureType.duplicated)) {
        log.warn({
            title: 'Router / afterEach',
            titleColor: LogPreDefinedColor.Emerald,
            messages: ['Duplicated navigation from', from.query, '\nto', to.query],
        })
    } else if (isNavigationFailure(failure, NavigationFailureType.aborted)) {
        log.debug({
            title: 'Router / afterEach',
            titleColor: LogPreDefinedColor.Emerald,
            messages: ['Navigation aborted from', from.query, '\nto', to.query],
        })
    } else if (failure && !isNavigationFailure(failure, NavigationFailureType.cancelled)) {
        log.error({
            title: 'Router / afterEach',
            titleColor: LogPreDefinedColor.Emerald,
            messages: ['Navigation failed from', from.query, '\nto', to.query, '\n\n', failure],
        })
    }
})
router.onError((error) => {
    if (isNavigationFailure(error, NavigationFailureType.aborted)) {
        log.error({
            title: 'Router / onError',
            titleColor: LogPreDefinedColor.Emerald,
            messages: ['Error while routing', error],
        })
    }
})

// exposing the router to Cypress, so that we may change URL param on the fly (without app reload),
// and this way test app reaction to URL changes
if (IS_TESTING_WITH_CYPRESS) {
    window.vueRouterHistory = history
    window.vueRouter = router
}

appReadinessRouterPlugin(router)
legacyPermalinkRouterPlugin(router)

export default router
