<script setup lang="ts">
import type { SingleCoordinate } from '@swissgeo/coordinates'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import GeoadminTooltip from '@swissgeo/tooltip'
import DOMPurify from 'dompurify'
import { computed, inject, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { type EditableFeature, EditableFeatureTypes } from '@/api/features.api'
import DrawingExporter from '@/modules/drawing/components/DrawingExporter.vue'
import DrawingHeader from '@/modules/drawing/components/DrawingHeader.vue'
import DrawingToolboxButton from '@/modules/drawing/components/DrawingToolboxButton.vue'
import SharePopup from '@/modules/drawing/components/SharePopup.vue'
import ShareWarningPopup from '@/modules/drawing/components/ShareWarningPopup.vue'
import { DrawingState } from '@/modules/drawing/lib/export-utils'
import useSaveKmlOnChange from '@/modules/drawing/useKmlDataManagement.composable'
import useDrawingStore from '@/store/modules/drawing'
import { EditMode } from '@/store/modules/drawing/types/EditMode.enum'
import ModalWithBackdrop from '@/utils/components/ModalWithBackdrop.vue'
import debounce from '@/utils/debounce'
import useUIStore from '@/store/modules/ui.store'
import useLayersStore from '@/store/modules/layers.store'
import useFeaturesStore from '@/store/modules/features.store'
import type { ActionDispatcher } from '@/store/types'
import type VectorLayer from 'ol/layer/Vector'
import log from '@swissgeo/log'

const dispatcher: ActionDispatcher = { name: 'DrawingToolbox.vue' }

const emits = defineEmits<{
    removeLastPoint: [void]
    closeDrawing: [void]
}>()

const drawingLayer = inject<VectorLayer>('drawingLayer')

const { saveState, deleteDrawing, debounceSaveDrawing } = useSaveKmlOnChange()

const { t } = useI18n()
const drawingStore = useDrawingStore()
const uiStore = useUIStore()
const layersStore = useLayersStore()
const featuresStore = useFeaturesStore()

const drawMenuOpen = ref<boolean>(true)
const showClearConfirmationModal = ref<boolean>(false)
const showShareModal = ref<boolean>(false)
const showNotSharedDrawingWarningModal = ref<boolean>(false)
const isClosingDrawing = ref<boolean>(false)
const showNoActiveKmlWarning = computed<boolean>(() => layersStore.activeKmlLayer === undefined)

const tooltipText = computed<string>(() =>
    t(showNoActiveKmlWarning.value ? 'drawing_empty_cannot_edit_name' : '')
)
const isDrawingLineOrMeasure = computed<boolean>(() => {
    return (
        !!drawingStore.mode &&
        [EditableFeatureTypes.LinePolygon, EditableFeatureTypes.Measure].includes(drawingStore.mode)
    )
})
const selectedLineString = computed<EditableFeature | undefined>(() => {
    return featuresStore.selectedEditableFeatures.find((feature) => {
        const geomType = feature.geometry?.type
        return (
            geomType === 'LineString' &&
            [EditableFeatureTypes.LinePolygon, EditableFeatureTypes.Measure].includes(
                feature.featureType
            )
        )
    })
})

const selectedLineCoordinates = computed<SingleCoordinate[] | undefined>(() => {
    const line = selectedLineString.value
    // Guard geometry existence and type
    if (line?.geometry?.type === 'LineString') {
        // geometry.coordinates is number[][] for LineString in our domain model
        // cast to be explicit (underlying geojson typing is a union)
        return line.geometry.coordinates as SingleCoordinate[]
    }
    return undefined
})
const isAllowDeleteLastPoint = computed<boolean>(
    () =>
        // Allow deleting the last point only if we are drawing line or measure
        // or when extending line
        isDrawingLineOrMeasure.value ||
        (drawingStore.editingMode === EditMode.Extend &&
            selectedLineString.value !== undefined &&
            selectedLineCoordinates.value !== undefined &&
            selectedLineCoordinates.value.length > 2)
)
const drawingName = computed<string | undefined>({
    get: () => drawingStore.name,
    set: (value) => debounceSaveDrawingName(value),
})
const isDrawingStateError = computed(() => (saveState.value as number) < 0)
/** Return a different translation key depending on the saving status */
const drawingStateMessage = computed(() => {
    switch (saveState.value as (typeof DrawingState)[keyof typeof DrawingState]) {
        case DrawingState.SAVING:
            return t('draw_file_saving')
        case DrawingState.SAVED:
            return t('draw_file_saved')
        case DrawingState.SAVE_ERROR:
            return t('draw_file_load_error')
        case DrawingState.LOAD_ERROR:
            return t('draw_file_save_error')
        default:
            return undefined
    }
})
const online = computed(() => drawingStore.online)

function onCloseClearConfirmation(confirmed: boolean) {
    showClearConfirmationModal.value = false
    if (confirmed) {
        drawingStore.clearDrawingFeatures(dispatcher)
        featuresStore.clearAllSelectedFeatures(dispatcher)
        drawingStore.setIsDrawingModified(false, dispatcher)
        drawingStore.setIsDrawingEditShared(false, dispatcher)
        drawingLayer?.getSource()?.clear()
        deleteDrawing().catch((error: Error) => log.error(`Error while deleting drawing: ${error}`))
        drawingStore.setDrawingMode(undefined, dispatcher)
        if (layersStore.activeKmlLayer) {
            layersStore.removeLayer(
                {
                    layerId: layersStore.activeKmlLayer.id,
                    isExternal: layersStore.activeKmlLayer.isExternal,
                    baseUrl: layersStore.activeKmlLayer.baseUrl,
                },
                dispatcher
            )
        }
    }
}

function closeDrawing() {
    isClosingDrawing.value = true
    if (drawingStore.showNotSharedDrawingWarning) {
        showNotSharedDrawingWarningModal.value = true
    } else {
        emits('closeDrawing')
    }
}

function onAcceptWarningModal() {
    showNotSharedDrawingWarningModal.value = false
    emits('closeDrawing')
}

function onCloseWarningModal() {
    isClosingDrawing.value = false
    showNotSharedDrawingWarningModal.value = false
}

function selectDrawingMode(drawingMode: EditableFeatureTypes) {
    drawingStore.setDrawingMode(drawingMode, dispatcher)
}

function onDeleteLastPoint() {
    emits('removeLastPoint')
}

function saveDrawingName(newName?: string) {
    const sanitized = DOMPurify.sanitize(newName ?? '', {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
        KEEP_CONTENT: false,
    }).trim()
    drawingStore.setDrawingName(sanitized, dispatcher)
    debounceSaveDrawing().catch((error: Error) =>
        log.error(`Error while saving drawing after name change: ${error}`)
    )
}

const debounceSaveDrawingName = debounce(saveDrawingName, 200)
</script>

<template>
    <teleport to=".drawing-toolbox-in-menu">
        <DrawingHeader
            v-if="uiStore.isDesktopMode"
            :is-closing-in-toolbox="isClosingDrawing"
            @close="closeDrawing"
        />
        <div :class="[{ 'drawing-toolbox-closed': !drawMenuOpen }, 'drawing-toolbox']">
            <div
                class="card drawing-toolbox-content rounded-bottom rounded-top-0 rounded-start-0 text-center shadow-lg"
                :class="{ 'rounded-bottom-0': uiStore.isPhoneMode }"
            >
                <GeoadminTooltip
                    :tooltip-content="tooltipText"
                    placement="bottom"
                    :disabled="!showNoActiveKmlWarning"
                >
                    <div
                        v-if="online"
                        class="d-flex justify-content-center align-items-center mx-4 mt-3 gap-2"
                    >
                        <label
                            for="drawing-name"
                            class="text-nowrap"
                        >
                            {{ t('file_name') }}
                        </label>
                        <input
                            id="drawing-name"
                            v-model="drawingName"
                            type="text"
                            class="form-control"
                            data-cy="drawing-toolbox-file-name-input"
                            :placeholder="`${t('draw_layer_label')}`"
                            :disabled="!layersStore.activeKmlLayer"
                        />
                    </div>
                </GeoadminTooltip>

                <div class="card-body position-relative container">
                    <div
                        class="row justify-content-start g-2"
                        :class="{ 'row-cols-2': uiStore.isDesktopMode }"
                    >
                        <div
                            v-for="drawingMode in Object.values(EditableFeatureTypes)"
                            :key="drawingMode"
                            class="col"
                            :class="{
                                'd-grid': uiStore.isPhoneMode,
                                'd-block': uiStore.isDesktopMode,
                            }"
                        >
                            <DrawingToolboxButton
                                :drawing-mode="drawingMode"
                                :is-active="drawingStore.mode === drawingMode"
                                :data-cy="`drawing-toolbox-mode-button-${drawingMode}`"
                                @set-drawing-mode="selectDrawingMode"
                            />
                        </div>
                        <button
                            v-if="uiStore.isPhoneMode"
                            class="btn d-flex align-items-center justify-content-center col-2"
                            data-cy="drawing-toolbox-close-button"
                            @click="closeDrawing"
                        >
                            <FontAwesomeIcon icon="times" />
                        </button>
                    </div>
                    <div class="row mt-1">
                        <div class="col">
                            <div
                                v-show="drawingStateMessage"
                                class="d-flex justify-content-center my-md-1 drawing-toolbox-drawing-state"
                                :class="{ 'text-danger': isDrawingStateError }"
                            >
                                {{ drawingStateMessage }}
                            </div>
                        </div>
                    </div>
                    <div class="row g-2">
                        <div class="col d-grid">
                            <button
                                :disabled="drawingStore.isDrawingEmpty"
                                class="btn-light btn"
                                data-cy="drawing-toolbox-delete-button"
                                @click="showClearConfirmationModal = true"
                            >
                                {{ t('delete') }}
                            </button>
                        </div>
                        <div class="col d-grid">
                            <DrawingExporter :is-drawing-empty="drawingStore.isDrawingEmpty" />
                        </div>
                        <div
                            v-if="online"
                            class="col d-grid"
                        >
                            <button
                                type="button"
                                class="btn btn-light"
                                :disabled="
                                    drawingStore.isDrawingEmpty || !layersStore.activeKmlLayer
                                "
                                data-cy="drawing-toolbox-share-button"
                                @click="showShareModal = true"
                            >
                                {{ t('share') }}
                            </button>
                        </div>
                    </div>
                    <div
                        v-if="isDrawingLineOrMeasure || isAllowDeleteLastPoint"
                        class="row mt-2"
                    >
                        <div class="col d-grid">
                            <button
                                data-cy="drawing-delete-last-point-button"
                                class="btn btn-outline-danger"
                                @click="onDeleteLastPoint"
                            >
                                {{ t('draw_button_delete_last_point') }}
                            </button>
                        </div>
                    </div>
                    <div
                        v-if="uiStore.isDesktopMode && online"
                        class="row mt-2"
                    >
                        <div
                            class="col text-muted text-center"
                            data-cy="drawing-toolbox-disclaimer"
                        >
                            <!-- eslint-disable vue/no-v-html-->
                            <small v-html="t('share_file_disclaimer')" />
                            <!-- eslint-enable vue/no-v-html-->
                        </div>
                    </div>
                </div>
            </div>
            <div
                v-if="uiStore.isDesktopMode"
                class="text-center"
            >
                <button
                    class="button-open-close-draw-menu btn btn-dark rounded-0 rounded-bottom m-auto ps-4 pe-4"
                    data-cy="menu-button"
                    @click="drawMenuOpen = !drawMenuOpen"
                >
                    <FontAwesomeIcon :icon="drawMenuOpen ? 'caret-up' : 'caret-down'" />
                    <span class="ms-2">{{ t(drawMenuOpen ? 'close_menu' : 'open_menu') }}</span>
                </button>
            </div>
        </div>
        <ModalWithBackdrop
            v-if="showClearConfirmationModal"
            show-confirmation-buttons
            fluid
            confirm-key="confirm_delete"
            confirm-icon="far fa-trash-alt"
            @close="onCloseClearConfirmation"
        >
            <div class="mb-2">
                {{ t('confirm_remove_all_features') }}
            </div>
            <div class="alert alert-warning">
                <FontAwesomeIcon
                    class="me-1"
                    icon="warning"
                />
                {{ t('confirm_no_cancel') }}
            </div>
        </ModalWithBackdrop>
        <ModalWithBackdrop
            v-if="showShareModal"
            fluid
            :title="t('share')"
            @close="showShareModal = false"
        >
            <SharePopup :kml-layer="layersStore.activeKmlLayer" />
        </ModalWithBackdrop>
        <ModalWithBackdrop
            v-if="showNotSharedDrawingWarningModal"
            fluid
            :title="t('warning')"
            @close="onCloseWarningModal()"
        >
            <ShareWarningPopup
                :kml-layer="layersStore.activeKmlLayer"
                @accept="onAcceptWarningModal()"
            />
        </ModalWithBackdrop>
    </teleport>
</template>

<style lang="scss" scoped>
@import '@/scss/media-query.mixin';
@import '@/scss/variables.module';

$animation-time: 0.5s;
$openCloseButtonHeight: 2.5rem;
// So that the toolbox can slip behind the header when the closing animation plays out.
$zindex-drawing-toolbox: -1;

.drawing-toolbox {
    position: relative;
    z-index: $zindex-drawing-toolbox;
    transition: transform $animation-time;
    .button-open-close-draw-menu {
        height: $openCloseButtonHeight;
    }
    &-mode-selector {
        margin: 0.5rem 0;
        display: grid;
        grid-template: 1fr / 1fr 1fr 1fr 1fr;
        gap: 0.25rem;
    }
    &-disclaimer {
        display: none;
    }
    &-drawing-state {
        color: #d3d3d3;
        font-size: 12px;
        line-height: 1.25;
        min-height: 1.25em;
    }
}

@include respond-above(phone) {
    .drawing-toolbox {
        position: absolute;
        max-width: $menu-tray-width;
        .drawing-toolbox-content {
            transition: opacity $animation-time;
        }
        &-closed {
            transform: translate(0px, calc(-100% + #{$openCloseButtonHeight}));
            .drawing-toolbox-content {
                opacity: 0;
            }
        }
        &-disclaimer {
            display: block;
        }
    }
}

@include respond-above(tablet) {
    .drawing-toolbox-mode-selector {
        margin: 1rem 2rem;
        grid-template: 1fr 1fr / 1fr 1fr;
        gap: 0.5rem 2rem;
    }
}
</style>
