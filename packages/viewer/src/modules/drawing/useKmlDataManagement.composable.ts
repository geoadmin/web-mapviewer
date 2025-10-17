import type { KMLLayer } from '@swissgeo/layers'
import type { Feature } from 'ol'
import type { Geometry } from 'ol/geom'
import type VectorLayer from 'ol/layer/Vector'
import type VectorSource from 'ol/source/Vector'

import { layerUtils } from '@swissgeo/layers/utils'
import log from '@swissgeo/log'
import { computed, inject, ref, toValue, type MaybeRefOrGetter } from 'vue'
import { useI18n } from 'vue-i18n'

import type { ActionDispatcher } from '@/store/types'

import { createKml, deleteKml, getKmlUrl, updateKml } from '@/api/files.api'
import { IS_TESTING_WITH_CYPRESS } from '@/config/staging.config'
import { DrawingState, generateKmlString } from '@/modules/drawing/lib/export-utils'
import useDrawingStore from '@/store/modules/drawing.store'
import useLayersStore from '@/store/modules/layers.store'
import usePositionStore from '@/store/modules/position.store'
import { parseKml } from '@/utils/kmlUtils'

const dispatcher: ActionDispatcher = { name: 'useKmlDataManagement.composable' }

// Shared state across composable instances
let differSaveDrawingTimeout: ReturnType<typeof setTimeout> | null = null
const saveState = ref<DrawingState>(DrawingState.INITIAL)

export interface DebounceOptions {
    debounceTime?: number
    retryOnError?: boolean
}

export default function useKmlDataManagement(
    drawingLayerDirectReference?: MaybeRefOrGetter<VectorLayer<VectorSource<Feature<Geometry>>> | null>
) {
    const drawingLayer = (inject(
        'drawingLayer',
        toValue(drawingLayerDirectReference ?? null)
    ) ?? toValue(drawingLayerDirectReference ?? null))

    const { t } = useI18n()
    const drawingStore = useDrawingStore()
    const layersStore = useLayersStore()
    const positionStore = usePositionStore()

    const online = computed(() => drawingStore.online)
    const projection = computed(() => positionStore.projection)
    const activeKmlLayer = computed(() => layersStore.activeKmlLayer)
    const availableIconSets = computed(() => drawingStore.iconSets)
    const temporaryKmlId = computed(() => (drawingStore).temporaryKmlId)
    const temporaryKml = computed<KMLLayer | undefined>(() => {
        const sysLayers = (layersStore.systemLayers ?? []) as { id: string }[]
        const match = sysLayers.find((l) => l.id === temporaryKmlId.value)
        return match as KMLLayer | undefined
    })
    const drawingName = computed(
        () => drawingStore.name ?? activeKmlLayer.value?.name ?? t('draw_layer_label')
    )

    let addKmlLayerTimeout: ReturnType<typeof setTimeout> | null = null
    const savesInProgress = ref<Promise<unknown>[]>([])

    function addKmlToDrawing(retryOnError = true) {
        if (!drawingLayer) { return }
        if (addKmlLayerTimeout) {
            clearTimeout(addKmlLayerTimeout)
            addKmlLayerTimeout = null
        }
        try {
            let availableKmlLayer: KMLLayer | undefined
            if (online.value) {
                log.debug('Add current active kml layer to drawing', activeKmlLayer.value!)
                availableKmlLayer = activeKmlLayer.value
            } else {
                log.debug('Add current temporary kml layer to drawing', temporaryKml.value!)
                availableKmlLayer = temporaryKml.value
            }
            if (!availableKmlLayer?.kmlData) {
                throw new Error('missing KML data')
            }

            const features = parseKml(
                availableKmlLayer,
                projection.value,
                availableIconSets.value,
                1000 // TODO: find good value or make optional
            )
            log.debug('Add features to drawing layer', features, drawingLayer)
            drawingLayer.getSource()?.addFeatures(features)

            drawingStore.setDrawingName(availableKmlLayer.name, dispatcher)
            drawingStore.setDrawingFeatures(
                features.map((feature) => String(feature.getId())),
                dispatcher
            )

            saveState.value = DrawingState.LOADED
        } catch (error) {
            if (online.value) {
                log.error(
                    `Failed to load KML ${activeKmlLayer.value?.fileId}`,
                    error as string,
                    activeKmlLayer.value!
                )
            } else {
                log.error(
                    `Failed to load temporary KML ${temporaryKmlId.value}`,
                    error as string,
                    temporaryKml.value!
                )
            }

            saveState.value = DrawingState.LOAD_ERROR
            if (!IS_TESTING_WITH_CYPRESS && retryOnError) {
                addKmlLayerTimeout = setTimeout(() => {
                    addKmlToDrawing(false)
                }, 2000)
            }
        }
    }

    async function saveDrawing({ retryOnError = true }: { retryOnError?: boolean }) {
        if (!drawingLayer) { return }
        try {
            log.debug(
                `Save drawing retryOnError ${retryOnError}, differSaveDrawing=${!!differSaveDrawingTimeout}`
            )
            clearPendingSaveDrawing()
            saveState.value = DrawingState.SAVING

            const kmlData = generateKmlString(
                projection.value,
                drawingLayer.getSource()?.getFeatures() ?? [],
                drawingName.value
            )

            if (online.value) {
                await saveOnlineDrawing(kmlData)
            } else {
                saveLocalDrawing(kmlData)
            }
            saveState.value = DrawingState.SAVED
        } catch (e: unknown) {
            log.error('Could not save KML layer: ', e as string)
            saveState.value = DrawingState.SAVE_ERROR
            if (!IS_TESTING_WITH_CYPRESS && retryOnError) {
                // Retry saving in 5 seconds
                debounceSaveDrawing({ debounceTime: 5000, retryOnError: false }).catch((error: Error) => {
                    log.error(`Error while retrying to save drawing: ${error}`)
                })
            }
        }
    }

    async function saveOnlineDrawing(kmlData: string) {
        const current = activeKmlLayer.value
        if (!current?.adminId) {
            // Create new KML (copy or new)
            const kmlMetadata = await createKml(kmlData)
            const kmlLayer = layerUtils.makeKMLLayer({
                name: drawingName.value,
                kmlFileUrl: getKmlUrl(kmlMetadata.id),
                isVisible: true,
                opacity: current?.opacity, // reuse current KML layer opacity, or undefined
                adminId: kmlMetadata.adminId,
                kmlData,
                kmlMetadata,
            })
            // If we are copying the active layer (no adminId), remove the old one to avoid duplicates
            if (current) {
                layersStore.removeLayer({ layerId: current.id }, dispatcher)
            }

            if (!layerUtils.isKmlLayerEmpty(kmlLayer)) {
                layersStore.addLayer({ layer: kmlLayer }, dispatcher)
            }
        } else {
            // Update existing KML
            const kmlMetadata = await updateKml(current.fileId!, current.adminId, kmlData)
            layersStore.setKmlGpxLayerData({
                layerId: current.id,
                data: kmlData,
                metadata: kmlMetadata,
            },
                dispatcher
            )
        }
    }

    function saveLocalDrawing(kmlData: string) {
        const kmlLayer = layerUtils.makeKMLLayer({
            name: drawingName.value,
            kmlFileUrl: temporaryKmlId.value!,
            isVisible: true,
            opacity: 1,
            kmlData,
        })

        if (!temporaryKml.value) {
            layersStore.addSystemLayer(kmlLayer as KMLLayer, dispatcher)
        } else {
            layersStore.updateSystemLayer(kmlLayer, dispatcher)
        }
    }

    /**
     * Deletes local drawing, and online drawing corresponding to the activeKmlLayer (if present)
     */
    async function deleteDrawing() {
        const current = activeKmlLayer.value
        if (current?.adminId && current.fileId) {
            await deleteKml(current.fileId, current.adminId)
        }
    }

    async function debounceSaveDrawing({
        debounceTime = 2000,
        retryOnError = true,
    }: DebounceOptions = {}) {
        log.debug(
            `Debouncing save drawing debounceTime=${debounceTime} differSaveDrawingTimeout=${!!differSaveDrawingTimeout}`
        )
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
        const savePromise = saveDrawing({ retryOnError })
        savesInProgress.value.push(savePromise)
        await savePromise
        // Remove this promise from the "in-progress" list when it's done
        const idx = savesInProgress.value.indexOf(savePromise)
        if (idx >= 0) savesInProgress.value.splice(idx, 1)
    }

    function clearPendingSaveDrawing() {
        if (differSaveDrawingTimeout) {
            clearTimeout(differSaveDrawingTimeout)
            differSaveDrawingTimeout = null
        }
    }

    /**
     * Call this when there are or will be unsaved changes. Change the saving status to "possibly unsaved changes".
     */
    function willModify() {
        if (saveState.value !== DrawingState.SAVE_ERROR) {
            saveState.value = DrawingState.UNSAVED_CHANGES
        }
    }

    return {
        addKmlToDrawing,
        deleteDrawing,
        debounceSaveDrawing,
        clearPendingSaveDrawing,
        willModify,
        saveState,
        savesInProgress,
    }
}