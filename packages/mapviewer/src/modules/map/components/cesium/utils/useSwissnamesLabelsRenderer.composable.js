import log from '@geoadmin/log'
import { CustomDataSource } from 'cesium'
import { onBeforeUnmount, onMounted } from 'vue'

import {
    getSwissnamesCameraRectangle,
    getSwissnamesEffectiveCameraAltitude,
    getVisibleSwissnamesTileEntries,
} from '@/modules/map/components/cesium/utils/swissnamesCamera'
import {
    buildSwissnamesConfigUrl,
    isSwissnamesLayerVisibleAtAltitude,
    normalizeSwissnamesConfig,
} from '@/modules/map/components/cesium/utils/swissnamesLabels'
import { createSwissnamesTileLoader } from '@/modules/map/components/cesium/utils/swissnamesTileLoader'

export default function useSwissnamesLabelsRenderer(getViewer, layerConfig) {
    let viewer = null
    let dataSource = null
    let labelsConfig = null
    let hasCameraListener = false
    let isDestroyed = false

    function getConfigUrl() {
        return buildSwissnamesConfigUrl(layerConfig.baseUrl, layerConfig.id)
    }

    function getConfigBaseUrl() {
        return getConfigUrl().replace(/\/mbtiles-layers\.json$/, '')
    }

    function canUseViewer(targetViewer = viewer) {
        return Boolean(targetViewer && !targetViewer.isDestroyed())
    }

    function isDataSourceAttached(targetViewer = viewer) {
        return Boolean(
            canUseViewer(targetViewer) &&
            dataSource &&
            targetViewer.dataSources.contains(dataSource)
        )
    }

    function canRenderLabels() {
        return !isDestroyed && isDataSourceAttached()
    }

    function requestRender(targetViewer = viewer) {
        if (canUseViewer(targetViewer)) {
            targetViewer.scene.requestRender()
        }
    }

    const tileLoader = createSwissnamesTileLoader({
        canRenderLabels,
        getConfigBaseUrl,
        getEntities: () => dataSource?.entities ?? null,
        getLabelsConfig: () => labelsConfig,
        getViewer: () => viewer,
        requestRender,
        retry: () => {
            if (!isDestroyed) {
                updateLabels()
            }
        },
    })

    function updateLabels() {
        if (isDestroyed || !labelsConfig || !canRenderLabels()) {
            return
        }
        const rectangle = getSwissnamesCameraRectangle(viewer)
        if (!rectangle) {
            return
        }
        const altitude = getSwissnamesEffectiveCameraAltitude(viewer)
        const visibleEntries = labelsConfig.layers
            .filter((layer) => isSwissnamesLayerVisibleAtAltitude(layer, altitude))
            .flatMap((layer) => getVisibleSwissnamesTileEntries(layer, rectangle))
        tileLoader.setVisibleEntries(visibleEntries)
        requestRender()
    }

    async function loadConfig() {
        const response = await fetch(getConfigUrl())
        if (!response.ok) {
            throw new Error(`Swissnames labels config returned HTTP ${response.status}`)
        }
        labelsConfig = normalizeSwissnamesConfig(await response.json())
    }

    onMounted(async () => {
        const mountedViewer = typeof getViewer === 'function' ? getViewer() : null
        viewer = mountedViewer
        if (!mountedViewer) {
            log.error('Failed to load Swissnames labels: missing Cesium viewer')
            return
        }
        try {
            dataSource = await mountedViewer.dataSources.add(new CustomDataSource(layerConfig.id))
            if (isDestroyed) {
                removeDataSource(mountedViewer)
                return
            }
            await loadConfig()
            if (isDestroyed) {
                removeDataSource(mountedViewer)
                return
            }
            mountedViewer.camera.moveEnd.addEventListener(updateLabels)
            hasCameraListener = true
            updateLabels()
        } catch (error) {
            removeDataSource(mountedViewer)
            if (!isDestroyed) {
                log.error('Failed to load Swissnames labels', error)
            }
        }
    })

    function removeCameraListener() {
        if (canUseViewer() && hasCameraListener) {
            viewer.camera.moveEnd.removeEventListener(updateLabels)
        }
        hasCameraListener = false
    }
    function removeDataSource(targetViewer = viewer) {
        if (isDataSourceAttached(targetViewer)) {
            dataSource.show = false
            targetViewer.dataSources.remove(dataSource)
            requestRender(targetViewer)
        }
        dataSource = null
    }

    onBeforeUnmount(() => {
        isDestroyed = true
        tileLoader.clear()
        removeCameraListener()
        removeDataSource()
        viewer = null
    })
}
