import { computed, inject, ref } from 'vue'
import { useStore } from 'vuex'

import { createKml, getKmlUrl, updateKml } from '@/api/files.api'
import KMLLayer from '@/api/layers/KMLLayer.class'
import { IS_TESTING_WITH_CYPRESS } from '@/config'
import { DrawingState, generateKmlString } from '@/modules/drawing/lib/export-utils'
import { parseKml } from '@/utils/kmlUtils'
import log from '@/utils/logging'

const dispatcher = { dispatcher: 'useKmlDataManagement.composable' }

// ref/variables outside useSaveKmlOnChange function so that they may be shared between all usages of the usaSaveKmlOnChange
let differSaveDrawingTimeout = null
const saveState = ref(DrawingState.INITIAL)

export default function useSaveKmlOnChange(drawingLayerDirectReference) {
    const drawingLayer = inject('drawingLayer', drawingLayerDirectReference)

    const store = useStore()
    const projection = computed(() => store.state.position.projection)
    const activeKmlLayer = computed(() => store.getters.activeKmlLayer)
    const availableIconSets = computed(() => store.state.drawing.iconSets)

    let addKmlLayerTimeout = null
    const savesInProgress = ref([])
    function addKmlLayerToDrawing(layer, retryOnError = true) {
        clearTimeout(addKmlLayerTimeout)
        try {
            if (!layer.kmlData) {
                throw new Error('missing KML data')
            }
            const features = parseKml(layer.kmlData, projection.value, availableIconSets.value)
            log.debug('Add features to drawing layer', features, drawingLayer)
            drawingLayer.getSource().addFeatures(features)
            store.dispatch('setDrawingFeatures', {
                featureIds: features.map((feature) => feature.id),
                ...dispatcher,
            })
            saveState.value = DrawingState.LOADED
        } catch (error) {
            log.error(`Failed to load KML ${layer.fileId}`, error, layer)
            saveState.value = DrawingState.LOAD_ERROR
            if (!IS_TESTING_WITH_CYPRESS && retryOnError) {
                addKmlLayerTimeout = setTimeout(() => {
                    addKmlLayerToDrawing(layer, false)
                }, 2000)
            }
        }
    }

    async function saveDrawing(retryOnError = true) {
        try {
            log.debug(`Save drawing retryOnError ${retryOnError}`)
            clearTimeout(differSaveDrawingTimeout)
            saveState.value = DrawingState.SAVING
            const kmlData = generateKmlString(
                projection.value,
                drawingLayer.getSource().getFeatures()
            )
            if (!activeKmlLayer.value?.adminId) {
                // creation of the new KML (copy or new)
                const kmlMetadata = await createKml(kmlData)
                const kmlLayer = new KMLLayer({
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
                        layer: activeKmlLayer.value,
                        ...dispatcher,
                    })
                }
                await store.dispatch('addLayer', {
                    layer: kmlLayer,
                    ...dispatcher,
                })
                saveState.value = DrawingState.SAVED
            } else {
                // if a KMLLayer is already defined, we update it
                const kmlMetadata = await updateKml(
                    activeKmlLayer.value.fileId,
                    activeKmlLayer.value.adminId,
                    kmlData
                )
                await store.dispatch('updateKmlGpxLayer', {
                    layerId: activeKmlLayer.value.id,
                    data: kmlData,
                    metadata: kmlMetadata,
                    ...dispatcher,
                })
                saveState.value = DrawingState.SAVED
            }
        } catch (e) {
            log.error('Could not save KML layer: ', e)
            saveState.value = DrawingState.SAVE_ERROR
            if (!IS_TESTING_WITH_CYPRESS && retryOnError) {
                // Retry saving in 5 seconds
                debounceSaveDrawing(5000, false)
            }
        }
    }

    function debounceSaveDrawing(debounceTime = 2000, retryOnError = true) {
        clearTimeout(differSaveDrawingTimeout)
        willModify()
        new Promise((resolve) => {
            // when testing, speed up and avoid race conditions
            // by only waiting for a small amount of time.
            // WARNING: don't use 0 here otherwise on CYPRESS you will end up with more request
            // than needed!
            differSaveDrawingTimeout = setTimeout(
                resolve,
                IS_TESTING_WITH_CYPRESS ? 100 : debounceTime
            )
        }).then(() => {
            const savePromise = saveDrawing(retryOnError)
            savesInProgress.value.push(savePromise)
            // removing this promise from the "in-progress" list when it's done
            savePromise.then(() =>
                savesInProgress.value.splice(savesInProgress.value.indexOf(savePromise), 1)
            )
        })
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
        addKmlLayerToDrawing,
        saveDrawing,
        debounceSaveDrawing,
        willModify,
        saveState,
        savesInProgress,
    }
}
