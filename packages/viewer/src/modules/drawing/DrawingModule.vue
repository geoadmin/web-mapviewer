<script setup lang="ts">
import type Feature from 'ol/Feature'
import type { Geometry } from 'ol/geom'
import type Map from 'ol/Map'

import { layerUtils } from '@swissgeo/layers/utils'
import log from '@swissgeo/log'
import { WarningMessage } from '@swissgeo/log/Message'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import {
    type ComponentPublicInstance,
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

import type { ActionDispatcher } from '@/store/types'

import { EditableFeatureTypes } from '@/api/features.api'
import { IS_TESTING_WITH_CYPRESS } from '@/config/staging.config'
import AddVertexButtonOverlay from '@/modules/drawing/components/AddVertexButtonOverlay.vue'
import DrawingInteractions from '@/modules/drawing/components/DrawingInteractions.vue'
import DrawingToolbox from '@/modules/drawing/components/DrawingToolbox.vue'
import DrawingTooltip from '@/modules/drawing/components/DrawingTooltip.vue'
import ShareWarningPopup from '@/modules/drawing/components/ShareWarningPopup.vue'
import { DrawingState } from '@/modules/drawing/lib/export-utils'
import useKmlDataManagement from '@/modules/drawing/useKmlDataManagement.composable'
import useDrawingStore from '@/store/modules/drawing'
import { EditMode } from '@/store/modules/drawing/types/EditMode.enum'
import useFeaturesStore from '@/store/modules/features'
import useLayersStore from '@/store/modules/layers'
import usePositionStore from '@/store/modules/position'
import useUiStore, { FeatureInfoPositions } from '@/store/modules/ui'
import ModalWithBackdrop from '@/utils/components/ModalWithBackdrop.vue'
import { getIcon, parseIconUrl } from '@/utils/kmlUtils'

const dispatcher: ActionDispatcher = { name: 'DrawingModule.vue' }

// OL map instance provided by the map module
const olMap = inject<Map>('olMap')!

// Pinia stores
const drawingStore = useDrawingStore()
const featuresStore = useFeaturesStore()
const layersStore = useLayersStore()
const positionStore = usePositionStore()
const uiStore = useUiStore()

// Refs
type DrawingInteractionsExposed = { removeLastPoint: () => void }
const drawingInteractions =
    useTemplateRef<ComponentPublicInstance<DrawingInteractionsExposed> | null>(
        'drawingInteractions'
    )
const isNewDrawing = ref(true)
const showNotSharedDrawingWarningModal = ref(false)

const { t } = useI18n()

// Minimal shape used from selected editable features
type EditableFeatureLite = {
    geometry: { type: string; coordinates: number[][] }
    featureType: EditableFeatureTypes
    icon?: { imageURL: string }
}

// Computed from stores
const availableIconSets = computed(() => drawingStore.iconSets)
const projection = computed(() => positionStore.projection)
const activeKmlLayer = computed(() => layersStore.activeKmlLayer)
const featureIds = computed(() => drawingStore.featureIds)
const isDrawingEmpty = computed(() => featureIds.value.length === 0)
const noFeatureInfo = computed(() => uiStore.noFeatureInfo)
const online = computed(() => drawingStore.online)

// Equivalent of old showNotSharedDrawingWarning getter
const showNotSharedDrawingWarning = computed(
    () =>
        drawingStore.isDrawingModified &&
        !drawingStore.isDrawingEditShared &&
        !drawingStore.isVisitWithAdminId
)

const selectedEditableFeatures = computed<EditableFeatureLite[]>(
    () => (featuresStore.selectedEditableFeatures as unknown as EditableFeatureLite[]) ?? []
)
const selectedLineFeature = computed<EditableFeatureLite | null>(() => {
    if (selectedEditableFeatures.value && selectedEditableFeatures.value.length > 0) {
        const selectedFeature = selectedEditableFeatures.value[0]!
        if (
            selectedFeature.geometry?.type === 'LineString' &&
            (selectedFeature.featureType === EditableFeatureTypes.LinePolygon ||
                selectedFeature.featureType === EditableFeatureTypes.Measure)
        ) {
            return selectedFeature
        }
    }
    return null
})
const showAddVertexButton = computed(
    () => drawingStore.editingMode === EditMode.Modify && !!selectedLineFeature.value
)
const editMode = computed(() => drawingStore.editingMode)
const currentDrawingMode = computed(() => drawingStore.mode)

const hasLoaded = computed(() => {
    return activeKmlLayer.value?.isLoading === false && !!activeKmlLayer.value?.kmlData
})
const hasKml = computed(() => {
    if (online.value) {
        return !!activeKmlLayer.value && !layerUtils.isKmlLayerEmpty(activeKmlLayer.value)
    }
    const sysLayers = layersStore.systemLayers ?? []
    return !!sysLayers.find((l) => l.id === drawingStore.temporaryKmlId)
})
// The drawing vector layer
const drawingLayer = new VectorLayer<VectorSource<Feature<Geometry>>>({
    source: createSourceForProjection(),
    zIndex: 9999,
})
// Provide for children that inject drawingLayer
provide('drawingLayer', drawingLayer)

const {
    addKmlToDrawing,
    debounceSaveDrawing,
    clearPendingSaveDrawing,
    saveState,
    savesInProgress,
} = useKmlDataManagement(drawingLayer)
const isDrawingModified = computed(() => {
    return ![DrawingState.INITIAL, DrawingState.LOADED, DrawingState.LOAD_ERROR].includes(
        saveState.value
    )
})

// React to projection changes
watch(projection, () => {
    drawingLayer.setSource(createSourceForProjection())
})
watch(hasLoaded, () => {
    if (hasLoaded.value) {
        addKmlToDrawing()
    }
})

// Watching feature IDs so we can react whenever one is removed through the "trash button"
watch(featureIds, (next: string[], last: string[]) => {
    const removed = last.filter((id) => !next.includes(id))
    if (removed.length > 0) {
        log.debug(`${removed.length} feature(s) have been removed, removing them from source`)
        const source = drawingLayer.getSource()
        if (!source) {
            return
        }
        source
            .getFeatures()
            .filter((feature) => removed.includes(String(feature.get('id'))))
            .forEach((feature) => source.removeFeature(feature))
        debounceSaveDrawing().catch((error) => {
            log.error('Error while saving drawing after feature removal', error)
        })
    }
})

// Workaround for legacy drawings and icon set mapping
watch(availableIconSets, () => {
    const source = drawingLayer.getSource()
    if (!source) {
        return
    }
    log.debug('New iconsets available update all drawing features', source.getFeatures())

    featureIds.value.forEach((featureId) => {
        const olFeature = source.getFeatureById(featureId)
        const editableFeature = olFeature?.get('editableFeature') as EditableFeatureLite | undefined
        if (editableFeature?.icon) {
            const iconArgs = parseIconUrl(editableFeature.icon.imageURL)
            const icon = getIcon(iconArgs, undefined /*iconStyle*/, availableIconSets.value, () => {
                // Fallback warning handler (Pinia app store could be used if available)
                log.warn(
                    new WarningMessage('kml_icon_set_not_found', { iconSetName: iconArgs!.set })
                )
            })
            if (icon) {
                editableFeature.icon = icon
            }
        }
    })
})

// Toggle edit mode based on selected features
watch(
    selectedEditableFeatures,
    (newValue) => {
        if ((newValue?.length ?? 0) > 0) {
            if (drawingStore.editingMode === EditMode.Off) {
                drawingStore.setEditingMode(EditMode.Modify, false, dispatcher)
            }
        } else {
            drawingStore.setEditingMode(EditMode.Off, false, dispatcher)
        }
    },
    { deep: false }
)

onMounted(() => {
    if (noFeatureInfo.value) {
        // Force feature info to be visible in drawing mode
        uiStore.setFeatureInfoPosition(FeatureInfoPositions.Default, dispatcher)
    }
    if (availableIconSets.value.length === 0) {
        // if icons have not yet been loaded, load them
        drawingStore.loadAvailableIconSets(dispatcher)
    }

    // Make sure no drawing features are selected when entering the drawing mode
    featuresStore.clearAllSelectedFeatures(dispatcher)
    isNewDrawing.value = true

    // If a KML was previously created with the drawing module, add it back for further editing
    if (hasKml.value) {
        isNewDrawing.value = false
        if (hasLoaded.value) {
            addKmlToDrawing()
        }
    } else {
        drawingStore.setDrawingName(t('draw_layer_label'), dispatcher)
    }

    olMap.addLayer(drawingLayer)

    // Listening for "Delete" keystroke and right-click to remove last point
    document.addEventListener('keyup', removeLastPointOnDeleteKeyUp, { passive: true })
    document.addEventListener('contextmenu', removeLastPointOnRightClick, { passive: true })
    window.addEventListener('beforeunload', beforeUnloadHandler)

    if (IS_TESTING_WITH_CYPRESS) {
        window.drawingLayer = drawingLayer
    }
})

onBeforeUnmount(() => {
    featuresStore.clearAllSelectedFeatures(dispatcher)
    drawingStore.setDrawingMode(undefined, dispatcher)

    drawingLayer.getSource()?.clear()
    olMap.removeLayer(drawingLayer)

    document.removeEventListener('contextmenu', removeLastPointOnRightClick)
    document.removeEventListener('keyup', removeLastPointOnDeleteKeyUp)
    window.removeEventListener('beforeunload', beforeUnloadHandler)

    if (IS_TESTING_WITH_CYPRESS) {
        delete window.drawingLayer
    }
})

const beforeUnloadHandler = (event: BeforeUnloadEvent) => {
    // Show alert when trying to close the tab, except during Cypress tests
    if (!IS_TESTING_WITH_CYPRESS && showNotSharedDrawingWarning.value) {
        showNotSharedDrawingWarningModal.value = true
        event.preventDefault()
        event.returnValue = ''
    }
}
function createSourceForProjection() {
    return new VectorSource<Feature<Geometry>>({
        useSpatialIndex: false,
        wrapX: true,
        // NOTE: VectorSource doesn't type a "projection" option; keep for runtime behavior and
        // @ts-expect-error to avoid TS error
        projection: projection.value?.epsg,
    })
}

function removeLastPoint() {
    // Only delete the last point when we are drawing a feature (or editing it)
    if (currentDrawingMode.value != null || editMode.value === EditMode.Extend) {
        drawingInteractions.value?.removeLastPoint()
    }
}

function removeLastPointOnRightClick(_event: MouseEvent) {
    removeLastPoint()
}

function removeLastPointOnDeleteKeyUp(event: KeyboardEvent) {
    if (event.key === 'Delete') {
        // Drawing modes will be checked by the function itself (no need to double-check)
        removeLastPoint()
    }
}

async function closeDrawing() {
    const requester = 'closing-drawing'
    uiStore.setLoadingBarRequester(requester, dispatcher)
    log.debug(
        `Closing drawing menu: isModified=${isDrawingModified.value}, isNew=${isNewDrawing.value}, isEmpty=${isDrawingEmpty.value}`
    )

    // Clear any pending save not started, then wait for in-progress saves
    clearPendingSaveDrawing()
    await Promise.all(savesInProgress.value ?? [])

    // Save on close when modified and (not new or not empty)
    if (isDrawingModified.value && (!isNewDrawing.value || !isDrawingEmpty.value)) {
        await debounceSaveDrawing({ debounceTime: 0, retryOnError: false })
    }

    drawingStore.toggleDrawingOverlay(dispatcher)
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
            :coordinates="selectedLineFeature?.geometry?.coordinates!"
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
