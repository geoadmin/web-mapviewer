import type { KMLLayer } from '@swissgeo/layers'
import type { ActionDispatcher } from '~/types/drawingStore'

import { filesAPI } from '@swissgeo/api'
import { layerUtils } from '@swissgeo/layers/utils'
import log from '@swissgeo/log'
import { generateKmlString, logConfig, useDrawingStore } from '#imports'

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
    if (drawingStore.save.state !== 'SAVE_ERROR') {
        drawingStore.setDrawingSaveState('UNSAVED_CHANGES', dispatcher)
    }
}

async function saveLocalDrawing(kmlData: string) {
    const drawingStore = useDrawingStore()
    const kmlMetadata = await filesAPI.createKml(kmlData, drawingStore.debug.staging)

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
}

async function saveDrawing({ retryOnError = true }: { retryOnError?: boolean }) {
    const drawingStore = useDrawingStore()

    if (!drawingStore.layer.ol) {
        log.error({
            ...logConfig('saveDrawing'),
            messages: ['Drawing layer not initialized, cannot save drawing. Skipping saveDrawing.'],
        })
        throw new Error('Drawing layer not initialized, cannot save drawing. Skipping saveDrawing.')
    }
    const kmlData = generateKmlString(
        drawingStore.projection,
        drawingStore.layer.ol?.getSource()?.getFeatures() ?? [],
        drawingStore.name
    )
    if (!drawingStore.online) {
        log.debug({
            ...logConfig('saveDrawing'),
            messages: ['Saving drawing locally', drawingStore.layer.temporaryKmlId],
        })
        await saveLocalDrawing(kmlData)
        // This has to be set so that the snot shared drawing warning is not shown after drawing an offline drawing
        // and then opening the drawing overlay and leaving it without drawing something
        drawingStore.setDrawingSaveState('INITIAL', dispatcher)
        return
    }

    try {
        log.debug({
            ...logConfig('saveDrawing'),
            messages: [
                `Save drawing retryOnError ${retryOnError}, differSaveDrawing=${!!differSaveDrawingTimeout}`,
            ],
        })
        clearPendingSaveDrawing()
        drawingStore.setDrawingSaveState('SAVING', dispatcher)

        const kmlData = generateKmlString(
            drawingStore.projection,
            drawingStore.layer.ol?.getSource()?.getFeatures() ?? [],
            drawingStore.name
        )

        if (drawingStore.layer.config?.fileId && drawingStore.layer.config?.adminId) {
            log.debug({
                ...logConfig('saveDrawing'),
                messages: [`Updating drawing with adminId ${drawingStore.layer.config.adminId}`],
            })
            drawingStore.layer.config.kmlMetadata = await filesAPI.updateKml(
                drawingStore.layer.config.fileId,
                drawingStore.layer.config.adminId,
                kmlData,
                drawingStore.debug.staging
            )
            drawingStore.layer.config.kmlData = kmlData
        } else {
            // Creating a new KML on the backend
            const kmlMetadata = await filesAPI.createKml(kmlData, drawingStore.debug.staging)

            let kmlLayer: KMLLayer
            if (drawingStore.layer.config) {
                log.debug({
                    ...logConfig('saveDrawing'),
                    messages: ['Copying existing KML layer', drawingStore.layer.config],
                })
                // copying the existing drawing's data/config (we don't have the adminId so we can't/mustn't update it)
                kmlLayer = layerUtils.cloneLayer(drawingStore.layer.config, {
                    kmlMetadata,
                    opacity: drawingStore.layer.config.opacity,
                    isEdited: true,
                    isLoading: false,
                })
            } else {
                log.debug({
                    ...logConfig('saveDrawing'),
                    messages: ['Creating new KML layer', drawingStore.name],
                })
                kmlLayer = layerUtils.makeKMLLayer({
                    name: drawingStore.name,
                    kmlFileUrl: filesAPI.getKmlUrl(kmlMetadata.id, drawingStore.debug.staging),
                    adminId: kmlMetadata.adminId,
                    isEdited: true,
                    isLoading: false,
                    kmlData,
                    kmlMetadata,
                })
            }

            kmlLayer.isVisible = true
            drawingStore.layer.config = kmlLayer
        }
        drawingStore.setDrawingSaveState('SAVED', dispatcher)
    } catch (e) {
        log.error({
            ...logConfig('saveDrawing'),
            messages: ['Could not save KML layer: ', e],
        })
        drawingStore.setDrawingSaveState('SAVE_ERROR', dispatcher)
        if (drawingStore.debug.retryOnError && retryOnError) {
            // Retry saving in 5 seconds
            debounceSaveDrawing({ debounceTime: 5000, retryOnError: false }).catch((error) => {
                log.error({
                    ...logConfig('saveDrawing'),
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
        ...logConfig('debounceSaveDrawing'),
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
                useDrawingStore().debug.quickDebounce ? Math.min(100, debounceTime) : debounceTime
            )
        })
    }
    await saveDrawing({ retryOnError })
}
