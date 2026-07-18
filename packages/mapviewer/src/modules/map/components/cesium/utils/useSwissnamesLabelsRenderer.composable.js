import log from '@geoadmin/log'
import { CustomDataSource } from 'cesium'
import { onBeforeUnmount, onMounted } from 'vue'

import { createSwissnamesLabelDataAdapter } from '@/api/swissnames.api'
import {
    getSwissnamesCameraRectangle,
    getSwissnamesEffectiveCameraAltitude,
    getVisibleSwissnamesTileEntries,
} from '@/modules/map/components/cesium/utils/swissnamesCamera'
import { isSwissnamesLayerVisibleAtAltitude } from '@/modules/map/components/cesium/utils/swissnamesLabels'
import { createSwissnamesTileLoader } from '@/modules/map/components/cesium/utils/swissnamesTileLoader'

export default function useSwissnamesLabelsRenderer(getViewer, layerConfig) {
    let viewer = null
    let dataSource = null
    let labelLayers = null
    let disposeCameraListener = null
    let isDestroyed = false

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

    const dataAdapter = createSwissnamesLabelDataAdapter(layerConfig.baseUrl, layerConfig.id)
    const tileLoader = createSwissnamesTileLoader({
        canRenderLabels,
        getEntities: () => dataSource.entities,
        getViewer: () => viewer,
        loadFeatures: dataAdapter.loadFeatures,
        requestRender,
        retry: updateLabels,
    })

    function updateLabels() {
        if (!canRenderLabels()) {
            return
        }
        const rectangle = getSwissnamesCameraRectangle(viewer)
        if (!rectangle) {
            return
        }
        const altitude = getSwissnamesEffectiveCameraAltitude(viewer)
        const visibleEntries = labelLayers
            .filter((layer) => isSwissnamesLayerVisibleAtAltitude(layer, altitude))
            .flatMap((layer) => getVisibleSwissnamesTileEntries(layer, rectangle))
        tileLoader.setVisibleEntries(visibleEntries)
        requestRender()
    }

    onMounted(async () => {
        const mountedViewer = getViewer()
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
            labelLayers = await dataAdapter.loadLayers()
            if (isDestroyed) {
                removeDataSource(mountedViewer)
                return
            }
            disposeCameraListener = mountedViewer.camera.moveEnd.addEventListener(updateLabels)
            updateLabels()
        } catch (error) {
            removeDataSource(mountedViewer)
            if (!isDestroyed) {
                log.error('Failed to load Swissnames labels', error)
            }
        }
    })

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
        disposeCameraListener?.()
        removeDataSource()
        viewer = null
    })
}
