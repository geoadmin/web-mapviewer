import log from '@geoadmin/log'

import {
    addSwissnamesFeatureLabels,
    getSwissnamesTerrainPositions,
    updateSwissnamesLabelVisibility,
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
    const failedTiles = new Set()
    const loggedFailures = new Set()

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

    function logTileFailureOnce(key, message, error = null) {
        if (loggedFailures.has(key)) {
            return
        }
        loggedFailures.add(key)
        if (error) {
            log.warn(message, error)
        } else {
            log.warn(message)
        }
    }

    function canStartTileLoad(key) {
        return (
            isTileVisible(key) &&
            !failedTiles.has(key) &&
            !pendingTileRequests.has(key) &&
            !tileCache.has(key)
        )
    }

    async function addTileLabels(layer, key, features) {
        const viewer = getViewer()
        if (!viewer) {
            return
        }
        const positions = await getSwissnamesTerrainPositions(viewer, features)
        if (!isTileVisible(key) || !canRenderLabels()) {
            return
        }
        const entities = getEntities()
        if (!entities) {
            return
        }
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
                return
            }
            if (features.length === 0) {
                tileCache.set(key, [])
            } else {
                await addTileLabels(layer, key, features)
            }
        } catch (error) {
            if (error?.name !== 'AbortError') {
                failedTiles.add(key)
                logTileFailureOnce(key, `Swissnames tile ${key} failed`, error)
            }
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

        updateSwissnamesLabelVisibility(tileCache, visibleTileKeys)
        visibleEntries.forEach(({ layer, tile, key }) => loadTile(layer, tile, key))
    }

    function clear() {
        if (retryTimer) {
            window.clearTimeout(retryTimer)
            retryTimer = null
        }
        for (const abortController of pendingTileRequests.values()) {
            abortController.abort()
        }
        tileCache.clear()
        pendingTileRequests.clear()
        failedTiles.clear()
        loggedFailures.clear()
        visibleTileKeys.clear()
    }

    return {
        clear,
        setVisibleEntries,
    }
}
