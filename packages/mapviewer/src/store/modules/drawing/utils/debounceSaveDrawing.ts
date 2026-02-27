import type { KMLLayer } from '@swissgeo/layers'

import { filesAPI } from '@swissgeo/api'
import { layerUtils } from '@swissgeo/layers/utils'
import log, { LogPreDefinedColor } from '@swissgeo/log'

import type { ActionDispatcher } from '@/store/types'

import { ENVIRONMENT, IS_TESTING_WITH_CYPRESS } from '@/config'
import { generateKmlString } from '@/modules/drawing/lib/export-utils'
import useDrawingStore from '@/store/modules/drawing'
import { DrawingSaveState } from '@/store/modules/drawing/types'
import { isOnlineMode } from '@/store/modules/drawing/utils/isOnlineMode'
import useLayersStore from '@/store/modules/layers'
import usePositionStore from '@/store/modules/position'

interface DebounceOptions {
    debounceTime?: number
    retryOnError?: boolean
}

const dispatcher: ActionDispatcher = { name: 'debounceSaveDrawing' }

let differSaveDrawingTimeout: ReturnType<typeof setTimeout> | undefined

function clearPendingSaveDrawing() {
    if (differSaveDrawingTimeout) {
        clearTimeout(differSaveDrawingTimeout)
        differSaveDrawingTimeout = undefined
    }
}

/**
 * Call this when there are or will be unsaved changes. Change the saving status to "possibly
 * unsaved changes".
 */
function willModify() {
    const drawingStore = useDrawingStore()
    if (drawingStore.save.state !== DrawingSaveState.SaveError) {
        drawingStore.setDrawingSaveState(DrawingSaveState.UnsavedChanges, dispatcher)
    }
}

async function saveLocalDrawing(kmlData: string) {
    const drawingStore = useDrawingStore()
    const layersStore = useLayersStore()
    const kmlMetadata = await filesAPI.createKml(kmlData, ENVIRONMENT)

    const kmlLayer = layerUtils.makeKMLLayer({
        name: drawingStore.name,
        kmlFileUrl: drawingStore.layer.temporaryKmlId,
        isVisible: true,
        opacity: 1,
        kmlData: kmlData,
        kmlMetadata,
        adminId: kmlMetadata.adminId,
        isEdited: true,
    })
    drawingStore.layer.config = kmlLayer

    if (!layersStore.systemLayers.find((systemLayer) => systemLayer.id === kmlLayer.id)) {
        layersStore.addSystemLayer(kmlLayer, dispatcher)
    } else {
        layersStore.updateSystemLayer(kmlLayer, dispatcher)
    }
}

async function saveDrawing({ retryOnError = true }: { retryOnError?: boolean }) {
    const drawingStore = useDrawingStore()

    if (!drawingStore.layer.ol) {
        return
    }
    const positionStore = usePositionStore()
    const kmlData = generateKmlString(
        positionStore.projection,
        drawingStore.layer.ol?.getSource()?.getFeatures() ?? [],
        drawingStore.name
    )
    if (!isOnlineMode(drawingStore.onlineMode)) {
        await saveLocalDrawing(kmlData)
        // This has to be set so that the snot shared drawing warning is not shown after drawing an offline drawing
        // and then opening the drawing overlay and leaving it without drawing something
        drawingStore.setDrawingSaveState(DrawingSaveState.Initial, dispatcher)
        return
    }
    const layersStore = useLayersStore()

    const drawingLayer = drawingStore.layer.config as KMLLayer

    try {
        log.debug({
            title: 'Drawing store / saveDrawing',
            titleColor: LogPreDefinedColor.Lime,
            messages: [
                `Save drawing retryOnError ${retryOnError}, differSaveDrawing=${!!differSaveDrawingTimeout}`,
            ],
        })
        clearPendingSaveDrawing()
        drawingStore.setDrawingSaveState(DrawingSaveState.Saving, dispatcher)

        const kmlData = generateKmlString(
            positionStore.projection,
            drawingStore.layer.ol?.getSource()?.getFeatures() ?? [],
            drawingStore.name
        )

        if (drawingStore.layer.config?.adminId) {
            log.debug({
                title: 'Drawing store / saveDrawing',
                titleColor: LogPreDefinedColor.Lime,
                messages: [`Updating drawing with adminId ${drawingStore.layer.config.adminId}`],
            })
            drawingStore.layer.config.kmlMetadata = await filesAPI.updateKml(
                drawingStore.layer.config.fileId,
                drawingStore.layer.config.adminId,
                kmlData,
                ENVIRONMENT
            )
            drawingStore.layer.config.kmlData = kmlData

            layersStore.updateLayer<KMLLayer>(drawingLayer, drawingLayer, dispatcher)
        } else {
            // Creating a new KML on the backend
            const kmlMetadata = await filesAPI.createKml(kmlData, ENVIRONMENT)

            let kmlLayer: KMLLayer
            if (drawingStore.layer.config) {
                log.debug({
                    title: 'Drawing store / saveDrawing',
                    titleColor: LogPreDefinedColor.Lime,
                    messages: ['Copying existing KML layer', drawingStore.layer.config],
                })
                // copying the existing drawing's data/config (we don't have the adminId so we can't/mustn't update it)
                kmlLayer = layerUtils.cloneLayer<KMLLayer>(drawingLayer, {
                    kmlMetadata,
                    opacity: drawingStore.layer.config.opacity,
                    isEdited: true,
                    isLoading: false,
                })
                // If we are copying the active layer (no adminId), remove the old one to avoid duplicates
                layersStore.removeLayer(drawingStore.layer.config.id, dispatcher)
            } else {
                log.debug({
                    title: 'Drawing store / saveDrawing',
                    titleColor: LogPreDefinedColor.Lime,
                    messages: ['Creating new KML layer', drawingStore.name],
                })
                kmlLayer = layerUtils.makeKMLLayer({
                    name: drawingStore.name,
                    kmlFileUrl: filesAPI.getKmlUrl(kmlMetadata.id, ENVIRONMENT),
                    adminId: kmlMetadata.adminId,
                    isEdited: true,
                    isLoading: false,
                    kmlData,
                    kmlMetadata,
                })
            }

            kmlLayer.isVisible = true
            drawingStore.layer.config = kmlLayer

            if (!layerUtils.isKmlLayerEmpty(kmlLayer)) {
                layersStore.addLayer(kmlLayer, dispatcher)
            }
        }
        drawingStore.setDrawingSaveState(DrawingSaveState.Saved, dispatcher)
    } catch (e) {
        log.error({
            title: 'Drawing store / saveDrawing',
            titleColor: LogPreDefinedColor.Lime,
            messages: ['Could not save KML layer: ', e],
        })
        drawingStore.setDrawingSaveState(DrawingSaveState.SaveError, dispatcher)
        if (!IS_TESTING_WITH_CYPRESS && retryOnError) {
            // Retry saving in 5 seconds
            debounceSaveDrawing({ debounceTime: 5000, retryOnError: false }).catch((error) => {
                log.error({
                    title: 'Drawing store / saveDrawing',
                    titleColor: LogPreDefinedColor.Lime,
                    messages: [`Error while retrying to save drawing:`, error],
                })
            })
        }
    }
}

export default async function debounceSaveDrawing({
    debounceTime = 2000,
    retryOnError = true,
}: DebounceOptions = {}) {
    log.debug({
        title: 'Drawing store / debounceSaveDrawing',
        titleColor: LogPreDefinedColor.Lime,
        messages: [
            `Debouncing save drawing debounceTime=${debounceTime} differSaveDrawingTimeout=${!!differSaveDrawingTimeout}`,
        ],
    })
    clearPendingSaveDrawing()
    willModify()
    if (debounceTime > 0) {
        await new Promise<void>((resolve) => {
            // When testing, speed up to avoid race conditions
            // WARNING: don't use 0 here otherwise on CYPRESS you will end up with more requests than needed!
            differSaveDrawingTimeout = setTimeout(
                () => resolve(),
                IS_TESTING_WITH_CYPRESS ? Math.min(100, debounceTime) : debounceTime
            )
        })
    }
    await saveDrawing({ retryOnError })
}
