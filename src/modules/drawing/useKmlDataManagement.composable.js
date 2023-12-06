import { computed, inject, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { createKml, getKml, getKmlUrl, updateKml } from '@/api/files.api'
import KMLLayer from '@/api/layers/KMLLayer.class'
import { IS_TESTING_WITH_CYPRESS } from '@/config'
import { parseKml } from '@/modules/drawing/lib/drawingUtils'
import { DrawingState, generateKmlString } from '@/modules/drawing/lib/export-utils'
import log from '@/utils/logging'

// ref/variables outside useSaveKmlOnChange function so that they may be shared between all usages of the usaSaveKmlOnChange
let differSaveDrawingTimeout = null
const saveState = ref(DrawingState.INITIAL)

export default function useSaveKmlOnChange(drawingLayerDirectReference) {
    const drawingLayer = inject('drawingLayer', drawingLayerDirectReference)

    const store = useStore()
    const projection = computed(() => store.state.position.projection)
    const activeKmlLayer = computed(() => store.getters.activeKmlLayer)
    const availableIconSets = computed(() => store.state.drawing.iconSets)

    const i18n = useI18n()

    let addKmlLayerTimeout = null
    async function addKmlLayerToDrawing(layer, retryOnError = true) {
        clearTimeout(addKmlLayerTimeout)
        try {
            const kml = await getKml(layer.fileId)
            const features = parseKml(kml, projection.value, availableIconSets.value)
            drawingLayer.getSource().addFeatures(features)
            store.dispatch(
                'setDrawingFeatures',
                features.map((feature) => feature.getId())
            )
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
                // if we don't have an adminId then create a new KML File
                const kmlMetadata = await createKml(kmlData)
                const kmlLayer = new KMLLayer(
                    getKmlUrl(kmlMetadata.id),
                    true, // visible
                    null, // opacity, null means use default
                    kmlMetadata.id,
                    kmlMetadata.adminId,
                    i18n.t('draw_layer_label'),
                    kmlData,
                    kmlMetadata,
                    false, // isExternal
                    false // isLoading, we already have kml data available, so no need to load it once more
                )
                await store.dispatch('addLayer', kmlLayer)
                saveState.value = DrawingState.SAVED
            } else {
                // if a KMLLayer is already defined, we update it
                const kmlMetadata = await updateKml(
                    activeKmlLayer.value.fileId,
                    activeKmlLayer.value.adminId,
                    kmlData
                )
                const clone = activeKmlLayer.value.clone()
                clone.kmlMetadata = kmlMetadata
                clone.kmlData = kmlData
                await store.dispatch('updateLayer', clone)
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
            saveDrawing(retryOnError)
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
    }
}
