import log from '@geoadmin/log'

import {
    addSwissnamesFeatureLabels,
    evictInvisibleSwissnamesLabels,
    getSwissnamesTerrainPositions,
} from '@/modules/map/components/cesium/utils/swissnamesLabelEntities'

const MAX_CONCURRENT_FETCHES = 32
const TILE_RETRY_DELAY = 500

export function createSwissnamesTileLoader({
    canRenderLabels,
    getEntities,
    getViewer,
    loadFeatures,
    requestRender,
    retry,
}) {
    let retryTimer = null
    let visibleTileKeys = new Set()

    const tileCache = new Map()
    const pendingTileRequests = new Map()
    const suppressedTileKeys = new Set()
    const retryingTileKeys = new Set()

    function isTileVisible(key) {
        return visibleTileKeys.has(key)
    }

    function scheduleRetry() {
        if (retryTimer) {
            return
        }
        retryTimer = window.setTimeout(() => {
            retryTimer = null
            retry()
        }, TILE_RETRY_DELAY)
    }

    function canStartTileLoad(key) {
        return (
            isTileVisible(key) &&
            !suppressedTileKeys.has(key) &&
            !pendingTileRequests.has(key) &&
            !tileCache.has(key)
        )
    }

    async function addTileLabels(layer, key, features) {
        const viewer = getViewer()
        const positions = await getSwissnamesTerrainPositions(viewer, features)
        if (!isTileVisible(key) || !canRenderLabels()) {
            return
        }
        const entities = getEntities()
        const labels = addSwissnamesFeatureLabels(entities, features, positions, layer)
        tileCache.set(key, labels)
    }

    async function loadTile(layer, tile, key) {
        if (!canStartTileLoad(key)) {
            return
        }
        if (pendingTileRequests.size >= MAX_CONCURRENT_FETCHES) {
            scheduleRetry()
            return
        }
        const abortController = new AbortController()
        pendingTileRequests.set(key, abortController)
        try {
            const features = await loadFeatures(layer, tile, abortController.signal)
            if (!isTileVisible(key) || !canRenderLabels()) {
                retryingTileKeys.delete(key)
                return
            }
            if (features.length === 0) {
                tileCache.set(key, [])
            } else {
                await addTileLabels(layer, key, features)
            }
            retryingTileKeys.delete(key)
        } catch (error) {
            if (error?.name === 'AbortError') {
                return
            }
            const wasRetrying = retryingTileKeys.delete(key)
            if (!wasRetrying) {
                retryingTileKeys.add(key)
                scheduleRetry()
                return
            }
            suppressedTileKeys.add(key)
            log.warn(`Swissnames tile ${key} failed`, error)
        } finally {
            const ownsPendingRequest = pendingTileRequests.get(key) === abortController
            if (ownsPendingRequest) {
                pendingTileRequests.delete(key)
                if (abortController.signal.aborted && isTileVisible(key)) {
                    scheduleRetry()
                }
            }
            requestRender()
        }
    }

    function setVisibleEntries(visibleEntries) {
        visibleTileKeys = new Set(visibleEntries.map(({ key }) => key))

        for (const [key, abortController] of pendingTileRequests.entries()) {
            if (!isTileVisible(key)) {
                abortController.abort()
            }
        }

        evictInvisibleSwissnamesLabels(getEntities(), tileCache, visibleTileKeys)
        visibleEntries.forEach(({ layer, tile, key }) => loadTile(layer, tile, key))
    }

    function clear() {
        window.clearTimeout(retryTimer)
        retryTimer = null
        for (const abortController of pendingTileRequests.values()) {
            abortController.abort()
        }
        tileCache.clear()
        pendingTileRequests.clear()
        suppressedTileKeys.clear()
        retryingTileKeys.clear()
        visibleTileKeys.clear()
    }

    return {
        clear,
        setVisibleEntries,
    }
}
