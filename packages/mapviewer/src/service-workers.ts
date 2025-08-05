/// <reference lib="webworker" />

import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { clientsClaim } from 'workbox-core'
import { ExpirationPlugin } from 'workbox-expiration'
import {
    cleanupOutdatedCaches,
    createHandlerBoundToURL,
    precacheAndRoute,
} from 'workbox-precaching'
import { NavigationRoute, registerRoute, Route } from 'workbox-routing'
import { NetworkFirst } from 'workbox-strategies'

import { getWmsBaseUrl, getWmtsBaseUrl } from '@/config/baseUrl.config'
import { IS_TESTING_WITH_CYPRESS } from '@/config/staging.config'

declare let self: ServiceWorkerGlobalScope

// disabling workbox's console.debug (comment that line if you need them)
self.__WB_DISABLE_DEV_LOGS = true

// Setting up Service Worker API to have a client-side cache.
// This means the app can mostly function in offline mode, so long as the initial load has happened naturally before.
// This is the first step to get a proper offline mode, where users will be able to select
// a zone on the map, and make it available offline (like it was the case with mf-geoadmin3 back then).

// Cypress doesn't handle well Service Worker API being active, so we skip the setup if we
// are testing things with Cypress
if (!IS_TESTING_WITH_CYPRESS) {
    // self.__WB_MANIFEST is the default injection point
    precacheAndRoute(self.__WB_MANIFEST)

    // clean old assets
    cleanupOutdatedCaches()

    let allowlist: RegExp[] | undefined
    // in dev mode, we disable precaching to avoid caching issues
    if (import.meta.env.DEV) {
        allowlist = [/^\/$/]
    }

    // setting up a cache instance for offline app assets (HTML/JS/CSS)
    registerRoute(
        new NavigationRoute(createHandlerBoundToURL(`index.html`), {
            allowlist,
            denylist: [
                // exclude all api calls, as the service worker might interacts with those in a way
                // that can shut down the service from the user's perspective
                // (injecting the cached index.html file instead of providing the expected output)
                /^\/api\//,
                // excluding the embed legacy endpoint, as it stops the redirection to the
                // `legacyEmbed` route and display map views instead of embed views
                /^\/embed/,
                // preview sites must be excluded too (we want the latest code, not some cached version)
                /^\/preview\//,
            ],
        }),
        new NetworkFirst({
            cacheName: 'geoadmin-app-cache',
        })
    )

    // caching essential backend items (layers config, topic list, etc...)
    const configItemPathNames = [
        // layers config
        '/rest/services/all/MapServer/layersConfig',
        // topic list
        '/rest/services',
        // default topic (ECH) detail
        '/rest/services/ech/CatalogServer',
    ]
    registerRoute(
        new Route(
            ({ url }) => {
                return configItemPathNames.includes(url.pathname)
            },
            new NetworkFirst({
                cacheName: 'geoadmin-app-config',
            })
        )
    )

    function removingTrailingSlash(url: string): string {
        if (url.endsWith('/')) {
            return url.slice(0, url.length - 1)
        }
        return url
    }

    // caching images from WMS and WMTS after they are loaded from the network
    const imageryBackends = [getWmsBaseUrl(), getWmtsBaseUrl()]
        // our base URLs end up with a '/', we don't want it in this context
        .map(removingTrailingSlash)
    registerRoute(
        new Route(
            ({ url }) => {
                return imageryBackends.includes(url.origin)
            },
            new NetworkFirst({
                cacheName: 'geoadmin-map-images-cache',
                plugins: [
                    new CacheableResponsePlugin({
                        // only cache valid responses (do not cache "no data" responses)
                        statuses: [0, 200],
                    }),
                    new ExpirationPlugin({
                        // one WMTS image is about 40ko, so 100 images would ends up as circa 4Mo cache size (per layer)
                        maxEntries: 100,
                    }),
                ],
            })
        )
    )

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    self.skipWaiting()
    clientsClaim()
}
