<script setup lang="ts">
import type { KMLLayer } from '@swissgeo/layers'
import type { LineString } from 'geojson'
import type Map from 'ol/Map'
import type { ComponentPublicInstance } from 'vue'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { LayerType } from '@swissgeo/layers'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import { WarningMessage } from '@swissgeo/log/Message'
import { computed, inject, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import type { EditableFeature } from '@/api/features.api'
import type { DrawingInteractionExposed } from '@/modules/drawing/types/interaction'
import type { ActionDispatcher } from '@/store/types'

import { EditableFeatureTypes } from '@/api/features.api'
import { IS_TESTING_WITH_CYPRESS } from '@/config/staging.config'
import AddVertexButtonOverlay from '@/modules/drawing/components/AddVertexButtonOverlay.vue'
import DrawingInteractions from '@/modules/drawing/components/DrawingInteractions.vue'
import DrawingToolbox from '@/modules/drawing/components/DrawingToolbox.vue'
import DrawingTooltip from '@/modules/drawing/components/DrawingTooltip.vue'
import ShareWarningPopup from '@/modules/drawing/components/ShareWarningPopup.vue'
import useDrawingStore from '@/store/modules/drawing'
import { EditMode } from '@/store/modules/drawing/types'
import addKmlFeaturesToDrawingLayer from '@/store/modules/drawing/utils/addKmlFeaturesToDrawingLayer'
import useLayersStore from '@/store/modules/layers'
import ModalWithBackdrop from '@/utils/components/ModalWithBackdrop.vue'
import { getIcon, parseIconUrl } from '@/utils/kmlUtils'

const dispatcher: ActionDispatcher = { name: 'DrawingModule.vue' }

// OL map instance provided by the map module
const olMap = inject<Map>('olMap')

if (!olMap) {
    log.error({
        title: 'DrawingModule',
        titleColor: LogPreDefinedColor.Lime,
        messages: [
            'DrawingModule requires the olMap to be provided',
            'Please make sure the map module is loaded before the drawing module',
        ],
    })
    throw new Error('DrawingModule requires the olMap to be provided')
}

const drawingStore = useDrawingStore()
const layersStore = useLayersStore()

const drawingInteractions =
    useTemplateRef<ComponentPublicInstance<DrawingInteractionExposed>>('drawingInteractions')
const showNotSharedDrawingWarningModal = ref<boolean>(false)
const drawingHasBeenInitialized = ref<boolean>(false)

const { t } = useI18n()

// Computed from stores
const availableIconSets = computed(() => drawingStore.iconSets)

// Equivalent of old showNotSharedDrawingWarning getter
const showNotSharedDrawingWarning = computed(
    () =>
        drawingStore.isDrawingModified &&
        !drawingStore.isDrawingEditShared &&
        !drawingStore.isVisitWithAdminId
)

const selectedLineFeature = computed<EditableFeature | undefined>(() => {
    if (
        drawingStore.feature.current &&
        drawingStore.feature.current.geometry?.type === 'LineString' &&
        (drawingStore.feature.current.featureType === EditableFeatureTypes.LinePolygon ||
            drawingStore.feature.current.featureType === EditableFeatureTypes.Measure)
    ) {
        return drawingStore.feature.current
    }
    return undefined
})
const lineStringGeometry = computed<LineString | undefined>(() => {
    if (selectedLineFeature.value) {
        return selectedLineFeature.value.geometry as LineString
    }
    return undefined
})
const hasLoaded = computed<boolean>(() => {
    return drawingStore.layer.config?.isLoading === false && !!drawingStore.layer.config?.kmlData
})

// Workaround for legacy drawings and icon set mapping
watch(availableIconSets, () => {
    const source = drawingStore.layer.ol?.getSource()
    if (!source) {
        return
    }
    log.debug({
        title: 'DrawingModule',
        titleColor: LogPreDefinedColor.Lime,
        messages: ['New icon sets available, updating all drawing features', source.getFeatures()],
    })

    drawingStore.feature.all.forEach((feature) => {
        if (feature.icon) {
            const iconArgs = parseIconUrl(feature.icon.imageURL)
            const icon = getIcon(iconArgs, undefined /*iconStyle*/, availableIconSets.value, () => {
                // Fallback warning handler (Pinia app store could be used if available)
                log.warn(
                    new WarningMessage('kml_icon_set_not_found', { iconSetName: iconArgs!.set })
                )
            })
            if (icon) {
                feature.icon = icon
            }
        }
    })
})

onMounted(() => {
    const kmlLayerWithAdminId: KMLLayer | undefined = layersStore.activeLayers
        .filter((layer) => layer.type === LayerType.KML)
        .map((layer) => layer as KMLLayer)
        .find((kmlLayer) => !!kmlLayer.adminId)

    drawingStore
        .initiateDrawing(
            {
                preExistingDrawing: kmlLayerWithAdminId,
                // TODO PB-2027: pass the adminId present in the URL at app startup
            },
            dispatcher
        )
        .then(() => {
            drawingHasBeenInitialized.value = true
            if (drawingStore.layer.ol) {
                olMap.addLayer(drawingStore.layer.ol)
            } else {
                log.error({
                    title: 'DrawingModule',
                    titleColor: LogPreDefinedColor.Lime,
                    messages: ['Drawing layer not found/not created'],
                })
            }
        })
        .catch((error) => {
            log.error({
                title: 'DrawingModule',
                titleColor: LogPreDefinedColor.Lime,
                messages: ['Error while initializing drawing', error],
            })
        })

    // If a KML was previously created with the drawing module, add it back for further editing
    if (drawingStore.layer.config) {
        if (hasLoaded.value) {
            addKmlFeaturesToDrawingLayer(drawingStore.layer.config, { retryOnError: true })
        }
    } else {
        drawingStore.setDrawingName(t('draw_layer_label'), dispatcher)
    }

    // Listening for "Delete" keystroke and right-click to remove last point
    document.addEventListener('keyup', removeLastPointOnDeleteKeyUp, { passive: true })
    document.addEventListener('contextmenu', removeLastPointOnRightClick, { passive: true })
    window.addEventListener('beforeunload', beforeUnloadHandler)
})

onBeforeUnmount(() => {
    document.removeEventListener('contextmenu', removeLastPointOnRightClick)
    document.removeEventListener('keyup', removeLastPointOnDeleteKeyUp)
    window.removeEventListener('beforeunload', beforeUnloadHandler)
})

const beforeUnloadHandler = (event: BeforeUnloadEvent) => {
    // Show alert when trying to close the tab, except during Cypress tests
    if (!IS_TESTING_WITH_CYPRESS && showNotSharedDrawingWarning.value) {
        showNotSharedDrawingWarningModal.value = true
        event.preventDefault()
    }
}

function removeLastPoint() {
    // Only delete the last point when we are drawing a feature (or editing it)
    if (!!drawingStore.edit.featureType || drawingStore.edit.mode === EditMode.Extend) {
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

function closeDrawing() {
    drawingStore
        .closeDrawing(dispatcher)
        .then(() => {
            if (drawingStore.layer.ol) {
                olMap!.removeLayer(drawingStore.layer.ol)
            }
        })
        .catch((error) => {
            log.error({
                title: 'DrawingModule',
                titleColor: LogPreDefinedColor.Lime,
                messages: ['Error while closing drawing', error],
            })
        })
}
</script>

<template>
    <div v-if="drawingHasBeenInitialized">
        <DrawingToolbox
            @remove-last-point="removeLastPoint"
            @close-drawing="closeDrawing"
        />
        <DrawingTooltip />
        <DrawingInteractions ref="drawingInteractions" />
        <AddVertexButtonOverlay
            v-if="drawingStore.edit.mode === EditMode.Modify && lineStringGeometry"
            :coordinates="lineStringGeometry.coordinates"
        />
        <ModalWithBackdrop
            v-if="showNotSharedDrawingWarningModal"
            fluid
            :title="t('warning')"
            @close="showNotSharedDrawingWarningModal = false"
        >
            <ShareWarningPopup
                :kml-layer="drawingStore.layer.config"
                @accept="showNotSharedDrawingWarningModal = false"
            />
        </ModalWithBackdrop>
    </div>
    <div v-else>
        <FontAwesomeIcon
            icon="spinner"
            spin
        />
    </div>
</template>
