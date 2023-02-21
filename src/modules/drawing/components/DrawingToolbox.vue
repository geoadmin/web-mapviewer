<template>
    <teleport v-if="readyForTeleport" to=".drawing-toolbox-in-menu">
        <DrawingHeader v-if="isDesktopMode" @close="emitCloseEvent" />
        <div :class="[{ 'drawing-toolbox-closed': !drawMenuOpen }, 'drawing-toolbox']">
            <div class="card text-center drawing-toolbox-content rounded-0">
                <div class="card-body position-relative container">
                    <div class="row justify-content-start row-cols-sm-2 g-2">
                        <div
                            v-for="drawingMode in drawingModes"
                            :key="drawingMode"
                            class="col d-grid"
                        >
                            <DrawingToolboxButton
                                :drawing-mode="drawingMode"
                                :is-active="currentDrawingMode === drawingMode"
                                :data-cy="`drawing-toolbox-mode-button-${drawingMode}`"
                                @set-drawing-mode="bubbleSetDrawingEventToParent"
                            />
                        </div>
                        <button
                            class="btn col-2 d-sm-none d-flex align-items-center justify-content-center"
                            data-cy="drawing-toolbox-close-button"
                            @click="emitCloseEvent"
                        >
                            <FontAwesomeIcon icon="times" />
                        </button>
                    </div>
                    <div class="row mt-1">
                        <div class="col">
                            <div
                              v-show="drawingStateMessage"
                              class="d-flex justify-content-center drawing-toolbox-drawing-state"
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
                                @click="showClearConfirmation"
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
                                @click="openShare"
                            >
                                {{ $t('share') }}
                            </button>
                        </div>
                    </div>
                    <div v-if="isDrawingLineOrMeasure" class="row mt-2">
                        <div class="col d-grid">
                            <button
                                v-if="isDrawingLineOrMeasure"
                                data-cy="drawing-delete-last-point-button"
                                class="btn btn-outline-danger"
                                @click="$emit('deleteLastPoint')"
                            >
                                {{ $t('draw_button_delete_last_point') }}
                            </button>
                        </div>
                    </div>
                    <div class="row mt-2 d-none d-sm-block">
                        <div class="col text-center text-muted">
                            <!-- eslint-disable vue/no-v-html-->
                            <small v-html="$t('share_file_disclaimer')" />
                            <!-- eslint-enable vue/no-v-html-->
                        </div>
                    </div>
                </div>
            </div>
            <div class="text-center d-none d-sm-block">
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
        <ModalWithBackdrop v-if="showShareModal" fluid :title="$t('share')" @close="onCloseShare">
            <SharePopup :kml-layer-id="kmlLayerId" :kml-admin-id="kmlAdminId" />
        </ModalWithBackdrop>
    </teleport>
</template>

<script>
import { EditableFeatureTypes } from '@/api/features.api'
import DrawingExporter from '@/modules/drawing/components/DrawingExporter.vue'
import DrawingToolboxButton from '@/modules/drawing/components/DrawingToolboxButton.vue'
import SharePopup from '@/modules/drawing/components/SharePopup.vue'
import ModalWithBackdrop from '@/utils/ModalWithBackdrop.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { mapGetters } from 'vuex'
import { DrawingState } from '../lib/export-utils'
import DrawingHeader from './DrawingHeader.vue'

export default {
    components: {
        FontAwesomeIcon,
        DrawingExporter,
        ModalWithBackdrop,
        DrawingToolboxButton,
        SharePopup,
        DrawingHeader,
    },
    props: {
        kmlLayerId: {
            type: String,
            default: null,
        },
        kmlAdminId: {
            type: String,
            default: null,
        },
        currentDrawingMode: {
            type: String,
            default: null,
        },
        isDrawingEmpty: {
            type: Boolean,
            default: false,
        },
        drawingState: {
            type: Number,
            default: DrawingState.INITIAL,
        },
    },
    emits: ['close', 'setDrawingMode', 'export', 'clearDrawing', 'deleteLastPoint'],
    data() {
        return {
            drawingModes: Object.values(EditableFeatureTypes),
            showShareModal: false,
            showClearConfirmationModal: false,
            readyForTeleport: false,
            drawMenuOpen: true,
        }
    },
    computed: {
        ...mapGetters(['isDesktopMode']),
        isDrawingLineOrMeasure() {
            return (
                this.currentDrawingMode === EditableFeatureTypes.LINEPOLYGON ||
                this.currentDrawingMode === EditableFeatureTypes.MEASURE
            )
        },

        /** Return a different translation key depending on the saving status */
        drawingStateMessage() {
            switch (this.drawingState) {
                case DrawingState.SAVING:
                    return this.$i18n.t('draw_file_saving')
                case DrawingState.SAVED:
                    return this.$i18n.t('draw_file_saved')
                case DrawingState.SAVE_ERROR:
                    return this.$i18n.t('draw_file_load_error')
                case DrawingState.LOAD_ERROR:
                    return this.$i18n.t('draw_file_save_error')
                default:
                    return null
            }
        },
        isDrawingStateError() {
            return this.drawingState < 0
        },
    },
    mounted() {
        this.$nextTick(() => {
            this.readyForTeleport = true
        })
    },
    methods: {
        emitCloseEvent() {
            this.$emit('close')
        },
        bubbleSetDrawingEventToParent(drawingMode) {
            this.$emit('setDrawingMode', drawingMode)
        },
        onCloseClearConfirmation(confirmed) {
            this.showClearConfirmationModal = false
            if (confirmed) {
                this.$emit('clearDrawing')
                this.$emit('setDrawingMode', null)
            }
        },
        onCloseShare() {
            this.showShareModal = false
        },
        openShare() {
            this.showShareModal = true
        },
        showClearConfirmation() {
            this.showClearConfirmationModal = true
        },
    },
}
</script>

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
