<script setup>
import log from '@geoadmin/log'
import { WarningMessage } from '@geoadmin/log/Message'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import {
    computed,
    inject,
    onBeforeUnmount,
    onMounted,
    provide,
    ref,
    useTemplateRef,
    watch,
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { EditableFeatureTypes } from '@/api/features/EditableFeature.class'
import { IS_TESTING_WITH_CYPRESS } from '@/config/staging.config'
import AddVertexButtonOverlay from '@/modules/drawing/components/AddVertexButtonOverlay.vue'
import DrawingInteractions from '@/modules/drawing/components/DrawingInteractions.vue'
import DrawingToolbox from '@/modules/drawing/components/DrawingToolbox.vue'
import DrawingTooltip from '@/modules/drawing/components/DrawingTooltip.vue'
import ShareWarningPopup from '@/modules/drawing/components/ShareWarningPopup.vue'
import { DrawingState } from '@/modules/drawing/lib/export-utils'
import useKmlDataManagement from '@/modules/drawing/useKmlDataManagement.composable'
import { EditMode } from '@/store/modules/drawing.store'
import { FeatureInfoPositions } from '@/store/modules/ui.store'
import ModalWithBackdrop from '@/utils/components/ModalWithBackdrop.vue'
import { getIcon, parseIconUrl } from '@/utils/kmlUtils'

const dispatcher = { dispatcher: 'DrawingModule.vue' }

const olMap = inject('olMap')

const drawingInteractions = useTemplateRef('drawingInteractions')
const isNewDrawing = ref(true)
const showNotSharedDrawingWarningModal = ref(false)

const { t } = useI18n()
const store = useStore()
const availableIconSets = computed(() => store.state.drawing.iconSets)
const projection = computed(() => store.state.position.projection)
const activeKmlLayer = computed(() => store.getters.activeKmlLayer)
const featureIds = computed(() => store.state.drawing.featureIds)
const isDrawingEmpty = computed(() => store.getters.isDrawingEmpty)
const noFeatureInfo = computed(() => store.getters.noFeatureInfo)
const online = computed(() => store.state.drawing.online)
const showNotSharedDrawingWarning = computed(() => store.getters.showNotSharedDrawingWarning)
const selectedEditableFeatures = computed(() => store.state.features.selectedEditableFeatures)
const selectedLineFeature = computed(() => {
    if (selectedEditableFeatures.value && selectedEditableFeatures.value.length > 0) {
        const selectedFeature = selectedEditableFeatures.value[0]
        if (
            selectedFeature.geometry.type === 'LineString' &&
            (selectedFeature.featureType === EditableFeatureTypes.LINEPOLYGON ||
                selectedFeature.featureType === EditableFeatureTypes.MEASURE)
        ) {
            return selectedFeature
        }
    }
    return null
})
const showAddVertexButton = computed(() => {
    return store.state.drawing.editingMode === EditMode.MODIFY && !!selectedLineFeature.value
})
const editMode = computed(() => store.state.drawing.editingMode)
const currentDrawingMode = computed(() => store.state.drawing.mode)

const hasLoaded = computed(() => {
    return activeKmlLayer.value?.isLoading === false && !!activeKmlLayer.value.kmlData
})
const hasKml = computed(() => {
    if (online.value) {
        return !!activeKmlLayer.value && !activeKmlLayer.value.isEmpty()
    }
    return !!store.state.layers.systemLayers.find(
        (l) => l.id === store.state.drawing.temporaryKmlId
    )
})

const drawingLayer = new VectorLayer({
    source: createSourceForProjection(),
    zIndex: 9999,
})
provide('drawingLayer', drawingLayer)

const {
    addKmlToDrawing,
    debounceSaveDrawing,
    clearPendingSaveDrawing,
    saveState,
    savesInProgress,
} = useKmlDataManagement(() => drawingLayer)
const isDrawingModified = computed(() => {
    return ![DrawingState.INITIAL, DrawingState.LOADED, DrawingState.LOAD_ERROR].includes(
        saveState.value
    )
})

watch(projection, () => {
    drawingLayer.setSource(createSourceForProjection())
})
watch(hasLoaded, () => {
    if (hasLoaded.value) {
        addKmlToDrawing()
    }
})
// watching feature IDs so that we can react whenever one is removed through the "trash button"
watch(featureIds, (next, last) => {
    const removed = last.filter((id) => !next.includes(id))
    if (removed.length > 0) {
        log.debug(`${removed.length} feature(s) have been removed, removing them from source`)
        const source = drawingLayer.getSource()
        source
            .getFeatures()
            .filter((feature) => removed.includes(feature.getId()))
            .forEach((feature) => source.removeFeature(feature))
        debounceSaveDrawing()
    }
})
watch(availableIconSets, () => {
    // Here this is a workaround for the legacy drawing opened in admin mode. In this case if
    // the availableIconSets is not yet loaded while parsing the KML, we cannot build the correct
    // DrawingIcon for default set icon because the icon name in the legacy icon service (mf-chsdi3)
    // did not have any numbered prefix. This means that without this workaround the icon preselection
    // from the set will not work and when modifying the drawing you might end up with a brocken
    // drawing.
    log.debug(
        'New iconsets available update all drawing features',
        drawingLayer.getSource().getFeatures()
    )
    featureIds.value.forEach((featureId) => {
        const feature = drawingLayer.getSource()?.getFeatureById(featureId)?.get('editableFeature')
        if (feature?.icon) {
            const iconArgs = parseIconUrl(feature.icon.imageURL)
            const icon = getIcon(iconArgs, null /*iconStyle*/, availableIconSets.value, () => {
                store.dispatch('addWarnings', {
                    warnings: [
                        new WarningMessage('kml_icon_set_not_found', {
                            iconSetName: iconArgs.set,
                        }),
                    ],
                    ...dispatcher,
                })
            })
            if (icon) {
                feature.icon = icon
            }
        }
    })
})
watch(selectedEditableFeatures, (newValue) => {
    if (newValue.length > 0) {
        if (store.state.drawing.editingMode === EditMode.OFF) {
            store.dispatch('setEditingMode', { mode: EditMode.MODIFY, ...dispatcher })
        }
    } else {
        store.dispatch('setEditingMode', { mode: EditMode.OFF, ...dispatcher })
    }
})
onMounted(() => {
    if (noFeatureInfo.value) {
        // Left clicking while in drawing mode has its own logic not covered in click-on-map-management.plugin.js
        // We force the featureInfo to be visible in drawing mode
        store.dispatch('setFeatureInfoPosition', {
            position: FeatureInfoPositions.DEFAULT,
            ...dispatcher,
        })
    }
    if (availableIconSets.value.length === 0) {
        // if icons have not yet been loaded, we do so
        store.dispatch('loadAvailableIconSets', dispatcher)
    }

    // We need to make sure that no drawing features are selected when entering the drawing
    // mode otherwise we cannot edit the selected features.
    store.dispatch('clearAllSelectedFeatures', dispatcher)
    isNewDrawing.value = true

    // if a KML was previously created with the drawing module
    // we add it back for further editing
    if (hasKml.value) {
        isNewDrawing.value = false
        if (hasLoaded.value) {
            addKmlToDrawing()
        }
    } else {
        store.dispatch('setDrawingName', {
            name: t('draw_layer_label'),
            ...dispatcher,
        })
    }
    olMap.addLayer(drawingLayer)

    // listening for "Delete" keystroke (to remove last point when drawing lines or measure)
    document.addEventListener('keyup', removeLastPointOnDeleteKeyUp, { passive: true })
    document.addEventListener('contextmenu', removeLastPointOnRightClick, { passive: true })
    window.addEventListener('beforeunload', beforeUnloadHandler)

    if (IS_TESTING_WITH_CYPRESS) {
        window.drawingLayer = drawingLayer
    }
})
onBeforeUnmount(() => {
    store.dispatch('clearAllSelectedFeatures', dispatcher)
    store.dispatch('setDrawingMode', { mode: null, ...dispatcher })

    drawingLayer.getSource().clear()
    olMap.removeLayer(drawingLayer)

    document.removeEventListener('contextmenu', removeLastPointOnRightClick)
    document.removeEventListener('keyup', removeLastPointOnDeleteKeyUp)
    window.removeEventListener('beforeunload', beforeUnloadHandler)

    if (IS_TESTING_WITH_CYPRESS) {
        delete window.drawingLayer
    }
})

const beforeUnloadHandler = (event) => {
    // This provokes the alert message to appear when trying to close the tab.
    // During Cypress tests this causes the test to run indefinitely, so to prevent this we skip the alert.
    if (!IS_TESTING_WITH_CYPRESS && showNotSharedDrawingWarning.value) {
        showNotSharedDrawingWarningModal.value = true
        event.returnValue = true
        event.preventDefault()
    }
}

function createSourceForProjection() {
    return new VectorSource({
        useSpatialIndex: false,
        wrapX: true,
        projection: projection.value.epsg,
    })
}
function removeLastPoint() {
    // only deleting the last point by right-click when we are drawing a feature (or editing it)
    if (currentDrawingMode.value !== null || editMode.value === EditMode.EXTEND) {
        drawingInteractions.value?.removeLastPoint()
    }
}

function removeLastPointOnRightClick(_event) {
    removeLastPoint()
}

function removeLastPointOnDeleteKeyUp(event) {
    if (event.key === 'Delete') {
        // drawing modes will be checked by the function itself (no need to double-check)
        removeLastPoint()
    }
}

async function closeDrawing() {
    const requester = 'closing-drawing'
    store.dispatch('setLoadingBarRequester', { requester, ...dispatcher })

    log.debug(
        `Closing drawing menu: isModified=${isDrawingModified.value}, isNew=${isNewDrawing.value}, isEmpty=${isDrawingEmpty.value}`
    )

    // clearing any pending save not started
    clearPendingSaveDrawing()
    // waiting for any saves in progress
    await Promise.all(savesInProgress.value)

    // We only trigger a kml save onClose drawing menu when the drawing has been modified and that
    // it is either not empty or not a new drawing.
    // We don't want to save new empty drawing, but we want to allow clearing existing drawing.
    if (isDrawingModified.value && (!isNewDrawing.value || !isDrawingEmpty.value)) {
        await debounceSaveDrawing({ debounceTime: 0, retryOnError: false })
    }

    await store.dispatch('toggleDrawingOverlay', dispatcher)
    store.dispatch('clearLoadingBarRequester', { requester, ...dispatcher })
}
</script>

<template>
    <div>
        <DrawingToolbox
            @remove-last-point="removeLastPoint"
            @close-drawing="closeDrawing"
        />
        <DrawingTooltip />
        <DrawingInteractions ref="drawingInteractions" />
        <AddVertexButtonOverlay
            v-if="showAddVertexButton"
            :coordinates="selectedLineFeature.geometry.coordinates"
        />
        <ModalWithBackdrop
            v-if="showNotSharedDrawingWarningModal"
            fluid
            :title="t('warning')"
            @close="showNotSharedDrawingWarningModal = false"
        >
            <ShareWarningPopup
                :kml-layer="activeKmlLayer"
                @accept="showNotSharedDrawingWarningModal = false"
            />
        </ModalWithBackdrop>
    </div>
</template>
