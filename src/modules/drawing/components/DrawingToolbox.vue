<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed, inject, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { EditableFeatureTypes } from '@/api/features.api'
import DrawingExporter from '@/modules/drawing/components/DrawingExporter.vue'
import DrawingToolboxButton from '@/modules/drawing/components/DrawingToolboxButton.vue'
import SharePopup from '@/modules/drawing/components/SharePopup.vue'
import { DrawingState } from '@/modules/drawing/lib/export-utils'
import useSaveKmlOnChange from '@/modules/drawing/useKmlDataManagement.composable'
import ModalWithBackdrop from '@/utils/components/ModalWithBackdrop.vue'

import DrawingHeader from './DrawingHeader.vue'

const drawingLayer = inject('drawingLayer')

const { saveState, debounceSaveDrawing } = useSaveKmlOnChange()
const i18n = useI18n()
const store = useStore()

const emits = defineEmits(['removeLastPoint', 'closeDrawing'])

const drawMenuOpen = ref(true)
const showClearConfirmationModal = ref(false)
const showShareModal = ref(false)

const isDesktopMode = computed(() => store.getters.isDesktopMode)
const isPhoneMode = computed(() => store.getters.isPhoneMode)
const isDrawingEmpty = computed(() => store.getters.isDrawingEmpty)
const currentDrawingMode = computed(() => store.state.drawing.mode)
const isDrawingLineOrMeasure = computed(() =>
    [EditableFeatureTypes.LINEPOLYGON, EditableFeatureTypes.MEASURE].includes(
        currentDrawingMode.value
    )
)
const activeKmlLayer = computed(() => store.getters.activeKmlLayer)
const kmlLayerId = computed(() => activeKmlLayer.value?.getID())
const kmlLayerAdminId = computed(() => activeKmlLayer.value?.adminId)

const isDrawingStateError = computed(() => saveState.value < 0)
/** Return a different translation key depending on the saving status */
const drawingStateMessage = computed(() => {
    switch (saveState.value) {
        case DrawingState.SAVING:
            return i18n.t('draw_file_saving')
        case DrawingState.SAVED:
            return i18n.t('draw_file_saved')
        case DrawingState.SAVE_ERROR:
            return i18n.t('draw_file_load_error')
        case DrawingState.LOAD_ERROR:
            return i18n.t('draw_file_save_error')
        default:
            return null
    }
})

function onCloseClearConfirmation(confirmed) {
    showClearConfirmationModal.value = false
    if (confirmed) {
        store.dispatch('clearDrawingFeatures')
        store.dispatch('clearAllSelectedFeatures')
        drawingLayer.getSource().clear()
        debounceSaveDrawing()
        store.dispatch('setDrawingMode', null)
    }
}
function closeDrawing() {
    emits('closeDrawing')
}
function selectDrawingMode(drawingMode) {
    store.dispatch('setDrawingMode', drawingMode)
}

function onDeleteLastPoint() {
    emits('removeLastPoint')
}
</script>

<template>
    <teleport to=".drawing-toolbox-in-menu">
        <DrawingHeader v-if="isDesktopMode" @close="closeDrawing" />
        <div :class="[{ 'drawing-toolbox-closed': !drawMenuOpen }, 'drawing-toolbox']">
            <div class="card text-center drawing-toolbox-content rounded-0">
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
                                {{ $t('delete') }}
                            </button>
                        </div>
                        <div class="col d-grid">
                            <DrawingExporter :is-drawing-empty="isDrawingEmpty" />
                        </div>
                        <div class="col d-grid">
                            <button
                                type="button"
                                class="btn btn-light"
                                :disabled="isDrawingEmpty || !kmlLayerId"
                                data-cy="drawing-toolbox-share-button"
                                @click="showShareModal = true"
                            >
                                {{ $t('share') }}
                            </button>
                        </div>
                    </div>
                    <div v-if="isDrawingLineOrMeasure" class="row mt-2">
                        <div class="col d-grid">
                            <button
                                data-cy="drawing-delete-last-point-button"
                                class="btn btn-outline-danger"
                                @click="onDeleteLastPoint"
                            >
                                {{ i18n.t('draw_button_delete_last_point') }}
                            </button>
                        </div>
                    </div>
                    <div v-if="isDesktopMode" class="row mt-2">
                        <div class="col text-center text-muted">
                            <!-- eslint-disable vue/no-v-html-->
                            <small v-html="i18n.t('share_file_disclaimer')" />
                            <!-- eslint-enable vue/no-v-html-->
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="isDesktopMode" class="text-center">
                <button
                    class="button-open-close-draw-menu btn btn-dark m-auto ps-4 pe-4 rounded-0 rounded-bottom"
                    data-cy="menu-button"
                    @click="drawMenuOpen = !drawMenuOpen"
                >
                    <FontAwesomeIcon :icon="drawMenuOpen ? 'caret-up' : 'caret-down'" />
                    <span class="ms-1">{{ $t(drawMenuOpen ? 'close_menu' : 'open_menu') }}</span>
                </button>
            </div>
        </div>
        <ModalWithBackdrop
            v-if="showClearConfirmationModal"
            show-confirmation-buttons
            fluid
            @close="onCloseClearConfirmation"
        >
            {{ $t('confirm_remove_all_features') }}
        </ModalWithBackdrop>
        <ModalWithBackdrop
            v-if="showShareModal"
            fluid
            :title="$t('share')"
            @close="showShareModal = false"
        >
            <SharePopup :kml-layer-id="kmlLayerId" :kml-admin-id="kmlLayerAdminId" />
        </ModalWithBackdrop>
    </teleport>
</template>

<style lang="scss" scoped>
@import 'src/scss/media-query.mixin';
@import 'src/scss/variables';

$animation-time: 0.5s;
$openCloseButtonHeight: 2.5rem;
// So that the toolbox can slip behind the header when the closing animation occurs.
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
            .drawing-toolbox-content {
                opacity: 0;
            }
            transform: translate(0px, calc(-100% + #{$openCloseButtonHeight}));
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
