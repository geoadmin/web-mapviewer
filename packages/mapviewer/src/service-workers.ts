/// <reference lib="webworker" />

import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { clientsClaim, setCacheNameDetails } from 'workbox-core'
import { ExpirationPlugin } from 'workbox-expiration'
import {
    cleanupOutdatedCaches,
    createHandlerBoundToURL,
    precacheAndRoute,
} from 'workbox-precaching'
import { NavigationRoute, registerRoute, Route } from 'workbox-routing'
import { StaleWhileRevalidate } from 'workbox-strategies'

import { getWmsBaseUrl, getWmtsBaseUrl } from '@/config/baseUrl.config'

declare let self: ServiceWorkerGlobalScope

setCacheNameDetails({
    prefix: 'geoadmin',
})

// self.__WB_MANIFEST is the default injection point
precacheAndRoute(self.__WB_MANIFEST)

// clean old assets
cleanupOutdatedCaches()

let allowlist: RegExp[] | undefined
// in dev mode, we disable precaching to avoid caching issues
if (import.meta.env.DEV) {
    allowlist = [/^\/$/]
}

// setting up offline app assets (HTML/JS/CSS)
registerRoute(
    new NavigationRoute(createHandlerBoundToURL('index.html'), { allowlist }),
    new StaleWhileRevalidate({
        cacheName: 'app-cache',
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
        new StaleWhileRevalidate({
            cacheName: 'app-config',
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
        new StaleWhileRevalidate({
            cacheName: 'map-images-cache',
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

self.skipWaiting()
clientsClaim()
