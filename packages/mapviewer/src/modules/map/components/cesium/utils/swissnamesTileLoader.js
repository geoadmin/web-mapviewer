import log from '@geoadmin/log'

import {
    addSwissnamesFeatureLabels,
    getSwissnamesTerrainPositions,
    updateSwissnamesLabelVisibility,
} from '@/modules/map/components/cesium/utils/swissnamesLabelEntities'
import {
    buildSwissnamesTileUrl,
    decodeSwissnamesFeatures,
} from '@/modules/map/components/cesium/utils/swissnamesLabels'

const MAX_CONCURRENT_FETCHES = 32
const TILE_RETRY_DELAY = 500

export function createSwissnamesTileLoader({
    canRenderLabels,
    getConfigBaseUrl,
    getEntities,
    getLabelsConfig,
    getViewer,
    requestRender,
    retry,
}) {
    let retryTimer = null
    let visibleTileKeys = new Set()

    const tileCache = new Map()
    const pendingTiles = new Set()
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
            !pendingTiles.has(key) &&
            !tileCache.has(key)
        )
    }

    async function fetchTileBuffer(layer, tile, key) {
        const response = await fetch(
            buildSwissnamesTileUrl(
                getConfigBaseUrl(),
                getLabelsConfig().s3BaseUrl,
                layer.file,
                tile
            )
        )
        if (!isTileVisible(key)) {
            return null
        }
        if (!response.ok) {
            failedTiles.add(key)
            logTileFailureOnce(key, `Swissnames tile ${key} returned HTTP ${response.status}`)
            return null
        }
        const buffer = await response.arrayBuffer()
        return isTileVisible(key) ? buffer : null
    }

    function decodeTileFeatures(tile, key, buffer) {
        if (!buffer) {
            return null
        }
        const features = decodeSwissnamesFeatures(buffer, tile)
        if (features.length === 0) {
            tileCache.set(key, [])
            return null
        }
        return features
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
        if (pendingTiles.size >= MAX_CONCURRENT_FETCHES) {
            scheduleRetry()
            return
        }
        pendingTiles.add(key)
        try {
            const buffer = await fetchTileBuffer(layer, tile, key)
            const features = decodeTileFeatures(tile, key, buffer)
            if (features) {
                await addTileLabels(layer, key, features)
            }
        } catch (error) {
            failedTiles.add(key)
            logTileFailureOnce(key, `Swissnames tile ${key} failed`, error)
        } finally {
            pendingTiles.delete(key)
            requestRender()
        }
    }

    function setVisibleEntries(visibleEntries) {
        visibleTileKeys = new Set(visibleEntries.map(({ key }) => key))
        updateSwissnamesLabelVisibility(tileCache, visibleTileKeys)
        visibleEntries.forEach(({ layer, tile, key }) => loadTile(layer, tile, key))
    }

    function clear() {
        if (retryTimer) {
            window.clearTimeout(retryTimer)
            retryTimer = null
        }
        tileCache.clear()
        pendingTiles.clear()
        failedTiles.clear()
        loggedFailures.clear()
        visibleTileKeys.clear()
    }

    return {
        clear,
        setVisibleEntries,
    }
}
