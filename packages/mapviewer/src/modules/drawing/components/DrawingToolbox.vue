<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import GeoadminTooltip from '@geoadmin/tooltip'
import DOMPurify from 'dompurify'
import { computed, inject, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { EditableFeatureTypes } from '@/api/features/EditableFeature.class'
import DrawingExporter from '@/modules/drawing/components/DrawingExporter.vue'
import DrawingHeader from '@/modules/drawing/components/DrawingHeader.vue'
import DrawingToolboxButton from '@/modules/drawing/components/DrawingToolboxButton.vue'
import SharePopup from '@/modules/drawing/components/SharePopup.vue'
import ShareWarningPopup from '@/modules/drawing/components/ShareWarningPopup.vue'
import { DrawingState } from '@/modules/drawing/lib/export-utils'
import useSaveKmlOnChange from '@/modules/drawing/useKmlDataManagement.composable'
import { EditMode } from '@/store/modules/drawing.store'
import ModalWithBackdrop from '@/utils/components/ModalWithBackdrop.vue'
import debounce from '@/utils/debounce'

const dispatcher = { dispatcher: 'DrawingToolbox.vue' }

const drawingLayer = inject('drawingLayer')
const { saveState, deleteDrawing, debounceSaveDrawing } = useSaveKmlOnChange()
const { t } = useI18n()
const store = useStore()

const emits = defineEmits(['removeLastPoint', 'closeDrawing'])

const drawMenuOpen = ref(true)
const showClearConfirmationModal = ref(false)
const showShareModal = ref(false)
const showNotSharedDrawingWarningModal = ref(false)
const showNotSharedDrawingWarning = computed(() => store.getters.showNotSharedDrawingWarning)
const isClosingDrawing = ref(false)
const showNoActiveKmlWarning = computed(() => !activeKmlLayer.value)

const tooltipText = computed(() => t(!activeKmlLayer.value ? 'drawing_empty_cannot_edit_name' : ''))
const isDesktopMode = computed(() => store.getters.isDesktopMode)
const isPhoneMode = computed(() => store.getters.isPhoneMode)
const isDrawingEmpty = computed(() => store.getters.isDrawingEmpty)
const currentDrawingMode = computed(() => store.state.drawing.mode)
const isDrawingLineOrMeasure = computed(() =>
    [EditableFeatureTypes.LINEPOLYGON, EditableFeatureTypes.MEASURE].includes(
        currentDrawingMode.value
    )
)
const selectedEditableFeatures = computed(() => store.state.features.selectedEditableFeatures)
const selectedLineString = computed(() => {
    return selectedEditableFeatures.value.find((feature) => {
        return (
            feature.geometry.type === 'LineString' &&
            [EditableFeatureTypes.LINEPOLYGON, EditableFeatureTypes.MEASURE].includes(
                feature.featureType
            )
        )
    })
})

const selectedLineCoordinates = computed(() => {
    if (selectedLineString.value) {
        return selectedLineString.value.geometry.coordinates
    }
    return null
})
const editMode = computed(() => store.state.drawing.editingMode)
const isAllowDeleteLastPoint = computed(
    () =>
        // Allow deleting the last point only if we are drawing line or measure
        // or when extending line
        isDrawingLineOrMeasure.value ||
        (editMode.value === EditMode.EXTEND &&
            selectedLineString.value &&
            selectedLineCoordinates.value?.length > 2)
)
const activeKmlLayer = computed(() => store.getters.activeKmlLayer)
const drawingName = computed({
    get: () => store.state.drawing.name,
    set: (value) => debounceSaveDrawingName(value),
})
const isDrawingStateError = computed(() => saveState.value < 0)
/** Return a different translation key depending on the saving status */
const drawingStateMessage = computed(() => {
    switch (saveState.value) {
        case DrawingState.SAVING:
            return t('draw_file_saving')
        case DrawingState.SAVED:
            return t('draw_file_saved')
        case DrawingState.SAVE_ERROR:
            return t('draw_file_load_error')
        case DrawingState.LOAD_ERROR:
            return t('draw_file_save_error')
        default:
            return null
    }
})
const online = computed(() => store.state.drawing.online)

function onCloseClearConfirmation(confirmed) {
    showClearConfirmationModal.value = false
    if (confirmed) {
        store.dispatch('clearDrawingFeatures', dispatcher)
        store.dispatch('clearAllSelectedFeatures', dispatcher)
        store.dispatch('setIsDrawingModified', { value: false, ...dispatcher })
        store.dispatch('setIsDrawingEditShared', { value: false, ...dispatcher })
        drawingLayer.getSource().clear()
        deleteDrawing()
        store.dispatch('setDrawingMode', { mode: null, ...dispatcher })
        store.dispatch('removeLayer', {
            layerId: activeKmlLayer.value.id,
            isExternal: activeKmlLayer.value.isExternal,
            baseUrl: activeKmlLayer.value.baseUrl,
            ...dispatcher,
        })
    }
}

function closeDrawing() {
    isClosingDrawing.value = true
    if (showNotSharedDrawingWarning.value) {
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

function selectDrawingMode(drawingMode) {
    store.dispatch('setDrawingMode', { mode: drawingMode, ...dispatcher })
}

function onDeleteLastPoint() {
    emits('removeLastPoint')
}

const debounceSaveDrawingName = debounce(async (newName) => {
    await store.dispatch('setDrawingName', {
        // sanitizing to avoid any XSS vector
        name: DOMPurify.sanitize(newName, {
            USE_PROFILES: { xml: true },
        }).trim(),
        ...dispatcher,
    })
    debounceSaveDrawing()
}, 200)
</script>

<template>
    <teleport to=".drawing-toolbox-in-menu">
        <DrawingHeader
            v-if="isDesktopMode"
            :is-closing-in-toolbox="isClosingDrawing"
            @close="closeDrawing"
        />
        <div :class="[{ 'drawing-toolbox-closed': !drawMenuOpen }, 'drawing-toolbox']">
            <div
                class="card text-center drawing-toolbox-content shadow-lg rounded-bottom rounded-top-0 rounded-start-0"
                :class="{ 'rounded-bottom-0': isPhoneMode }"
            >
                <GeoadminTooltip
                    :tooltip-content="tooltipText"
                    placement="bottom"
                    :disabled="!showNoActiveKmlWarning"
                >
                    <div
                        v-if="online"
                        class="d-flex justify-content-center align-items-center gap-2 mt-3 mx-4"
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
                            :disabled="!activeKmlLayer"
                        />
                    </div>
                </GeoadminTooltip>

                <div class="card-body position-relative container">
                    <div
                        class="row justify-content-start g-2"
                        :class="{ 'row-cols-2': isDesktopMode }"
                    >
                        <div
                            v-for="drawingMode in Object.values(EditableFeatureTypes)"
                            :key="drawingMode"
                            class="col"
                            :class="{
                                'd-grid': isPhoneMode,
                                'd-block': isDesktopMode,
                            }"
                        >
                            <DrawingToolboxButton
                                :drawing-mode="drawingMode"
                                :is-active="currentDrawingMode === drawingMode"
                                :data-cy="`drawing-toolbox-mode-button-${drawingMode}`"
                                @set-drawing-mode="selectDrawingMode"
                            />
                        </div>
                        <button
                            v-if="isPhoneMode"
                            class="btn col-2 d-flex align-items-center justify-content-center"
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
                                :disabled="isDrawingEmpty"
                                class="btn-light btn"
                                data-cy="drawing-toolbox-delete-button"
                                @click="showClearConfirmationModal = true"
                            >
                                {{ t('delete') }}
                            </button>
                        </div>
                        <div class="col d-grid">
                            <DrawingExporter :is-drawing-empty="isDrawingEmpty" />
                        </div>
                        <div
                            v-if="online"
                            class="col d-grid"
                        >
                            <button
                                type="button"
                                class="btn btn-light"
                                :disabled="isDrawingEmpty || !activeKmlLayer"
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
                        v-if="isDesktopMode && online"
                        class="row mt-2"
                    >
                        <div
                            class="col text-center text-muted"
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
                v-if="isDesktopMode"
                class="text-center"
            >
                <button
                    class="button-open-close-draw-menu btn btn-dark m-auto ps-4 pe-4 rounded-0 rounded-bottom"
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
            @close="onCloseClearConfirmation"
        >
            {{ t('confirm_remove_all_features') }}
        </ModalWithBackdrop>
        <ModalWithBackdrop
            v-if="showShareModal"
            fluid
            :title="t('share')"
            @close="showShareModal = false"
        >
            <SharePopup :kml-layer="activeKmlLayer" />
        </ModalWithBackdrop>
        <ModalWithBackdrop
            v-if="showNotSharedDrawingWarningModal"
            fluid
            :title="t('warning')"
            @close="onCloseWarningModal()"
        >
            <ShareWarningPopup
                :kml-layer="activeKmlLayer"
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
