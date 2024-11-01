import { computed, inject, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { createKml, getKmlUrl, updateKml } from '@/api/files.api'
import KMLLayer from '@/api/layers/KMLLayer.class'
import { IS_TESTING_WITH_CYPRESS } from '@/config/staging.config'
import { DrawingState, generateKmlString } from '@/modules/drawing/lib/export-utils'
import { parseKml } from '@/utils/kmlUtils'
import log from '@/utils/logging'

const dispatcher = { dispatcher: 'useKmlDataManagement.composable' }

// ref/variables outside useSaveKmlOnChange function so that they may be shared between all usages of the usaSaveKmlOnChange
let differSaveDrawingTimeout = null
const saveState = ref(DrawingState.INITIAL)

export default function useSaveKmlOnChange(drawingLayerDirectReference) {
    const drawingLayer = inject('drawingLayer', drawingLayerDirectReference)

    const i18n = useI18n()
    const store = useStore()
    const online = computed(() => store.state.drawing.online)
    const projection = computed(() => store.state.position.projection)
    const activeKmlLayer = computed(() => store.getters.activeKmlLayer)
    const availableIconSets = computed(() => store.state.drawing.iconSets)
    const temporaryKmlId = computed(() => store.state.drawing.temporaryKmlId)
    const temporaryKml = computed(() =>
        store.state.layers.systemLayers.find((l) => l.id === temporaryKmlId.value)
    )
    const drawingName = computed(
        () => store.state.drawing.name ?? activeKmlLayer.value?.name ?? i18n.t('draw_layer_label')
    )

    let addKmlLayerTimeout = null
    const savesInProgress = ref([])
    function addKmlToDrawing(retryOnError = true) {
        clearTimeout(addKmlLayerTimeout)
        try {
            let availableKmlLayer = null
            if (online.value) {
                log.debug(`Add current active kml layer to drawing`, activeKmlLayer.value)
                availableKmlLayer = activeKmlLayer.value
            } else {
                log.debug(`Add current temporary kml layer to drawing`, temporaryKml.value)
                availableKmlLayer = temporaryKml.value
            }
            if (!availableKmlLayer?.kmlData) {
                throw new Error('missing KML data')
            }
            const features = parseKml(availableKmlLayer, projection.value, availableIconSets.value)
            log.debug('Add features to drawing layer', features, drawingLayer)
            drawingLayer.getSource().addFeatures(features)
            store.dispatch('setDrawingName', {
                name: availableKmlLayer.name,
                ...dispatcher,
            })
            store.dispatch('setDrawingFeatures', {
                featureIds: features.map((feature) => feature.getId()),
                ...dispatcher,
            })
            saveState.value = DrawingState.LOADED
        } catch (error) {
            if (online.value) {
                log.error(
                    `Failed to load KML ${activeKmlLayer.value?.fileId}`,
                    error,
                    activeKmlLayer.value
                )
            } else {
                log.error(
                    `Failed to load temporary KML ${temporaryKmlId.value}`,
                    error,
                    temporaryKml.value
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

    async function saveDrawing({ retryOnError = true }) {
        try {
            log.debug(
                `Save drawing retryOnError ${retryOnError}, differSaveDrawing=${differSaveDrawingTimeout}`
            )
            clearPendingSaveDrawing()
            saveState.value = DrawingState.SAVING
            const kmlData = generateKmlString(
                projection.value,
                drawingLayer.getSource().getFeatures(),
                drawingName.value
            )
            if (online.value) {
                await saveOnlineDrawing(kmlData)
            } else {
                await saveLocalDrawing(kmlData)
            }
            saveState.value = DrawingState.SAVED
        } catch (e) {
            log.error('Could not save KML layer: ', e)
            saveState.value = DrawingState.SAVE_ERROR
            if (!IS_TESTING_WITH_CYPRESS && retryOnError) {
                // Retry saving in 5 seconds
                debounceSaveDrawing({ debounceTime: 5000, retryOnError: false })
            }
        }
    }

    /**
     * @param {String} kmlData
     * @returns {Promise<void>}
     */
    async function saveOnlineDrawing(kmlData) {
        if (!activeKmlLayer.value?.adminId) {
            // creation of the new KML (copy or new)
            const kmlMetadata = await createKml(kmlData)
            const kmlLayer = new KMLLayer({
                name: drawingName.value,
                kmlFileUrl: getKmlUrl(kmlMetadata.id),
                visible: true,
                opacity: activeKmlLayer.value?.opacity, // re-use current KML layer opacity, or null
                adminId: kmlMetadata.adminId,
                kmlData: kmlData,
                kmlMetadata: kmlMetadata,
            })
            // If there's already an activeKmlLayer, but without adminId, it means we are copying it and editing it.
            // Meaning we must remove the old one from the layers; it will otherwise be there twice
            // (once the pristine "old" KML, and once the new copy)
            if (activeKmlLayer.value) {
                await store.dispatch('removeLayer', {
                    layerId: activeKmlLayer.value.id,
                    ...dispatcher,
                })
            }
            await store.dispatch('addLayer', {
                layer: kmlLayer,
                ...dispatcher,
            })
        } else {
            // if a KMLLayer is already defined, we update it
            const kmlMetadata = await updateKml(
                activeKmlLayer.value.fileId,
                activeKmlLayer.value.adminId,
                kmlData
            )
            await store.dispatch('setKmlGpxLayerData', {
                layerId: activeKmlLayer.value.id,
                data: kmlData,
                metadata: kmlMetadata,
                ...dispatcher,
            })
        }
    }

    /**
     * @param {String} kmlData
     * @returns {Promise<void>}
     */
    async function saveLocalDrawing(kmlData) {
        const kmlLayer = new KMLLayer({
            name: drawingName.value,
            kmlFileUrl: temporaryKmlId.value,
            visible: true,
            opacity: 1,
            kmlData: kmlData,
        })
        if (!temporaryKml.value) {
            await store.dispatch('addSystemLayer', { layer: kmlLayer, ...dispatcher })
        } else {
            await store.dispatch('updateSystemLayer', { layer: kmlLayer, ...dispatcher })
        }
    }

    async function debounceSaveDrawing({ debounceTime = 2000, retryOnError = true } = {}) {
        log.debug(
            `Debouncing save drawing debounceTime=${debounceTime} differSaveDrawingTimeout=${differSaveDrawingTimeout}`
        )
        clearPendingSaveDrawing()
        willModify()
        if (debounceTime > 0) {
            await new Promise((resolve) => {
                // when testing, speed up and avoid race conditions
                // by only waiting for a small amount of time.
                // WARNING: don't use 0 here otherwise on CYPRESS you will end up with more request
                // than needed!
                differSaveDrawingTimeout = setTimeout(
                    resolve,
                    IS_TESTING_WITH_CYPRESS ? Math.min(100, debounceTime) : debounceTime
                )
            })
        }
        const savePromise = saveDrawing({ retryOnError, drawingName })
        savesInProgress.value.push(savePromise)
        await savePromise
        // removing this promise from the "in-progress" list when it's done
        savesInProgress.value.splice(savesInProgress.value.indexOf(savePromise), 1)
    }

    function clearPendingSaveDrawing() {
        clearTimeout(differSaveDrawingTimeout)
        differSaveDrawingTimeout = null
    }

    /**
     * Call this method when there are or when there will be unsaved changes. Change the saving
     * status to "possibly unsaved changes"
     */
    function willModify() {
        if (saveState.value !== DrawingState.SAVE_ERROR) {
            saveState.value = DrawingState.UNSAVED_CHANGES
        }
    }

    return {
        addKmlToDrawing,
        debounceSaveDrawing,
        clearPendingSaveDrawing,
        willModify,
        saveState,
        savesInProgress,
    }
}
