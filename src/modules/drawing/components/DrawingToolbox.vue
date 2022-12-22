<template>
    <teleport v-if="readyForTeleport" to=".drawing-toolbox-in-menu">
        <DrawingHeader v-if="isDesktopMode" @close="emitCloseEvent" />
        <div :class="[{ 'drawing-toolbox-closed': !drawMenuOpen }, 'drawing-toolbox']">
            <div class="card text-center drawing-toolbox-content rounded-0">
                <div class="card-body position-relative">
                    <ButtonWithIcon
                        class="drawing-toolbox-close-button"
                        data-cy="drawing-toolbox-close-button"
                        :button-font-awesome-icon="['fas', 'times']"
                        transparent
                        @click="emitCloseEvent"
                    />
                    <div class="drawing-toolbox-mode-selector">
                        <DrawingToolboxButton
                            v-for="drawingMode in drawingModes"
                            :key="drawingMode"
                            :drawing-mode="drawingMode"
                            :is-active="currentDrawingMode === drawingMode"
                            :data-cy="`drawing-toolbox-mode-button-${drawingMode}`"
                            @set-drawing-mode="bubbleSetDrawingEventToParent"
                        />
                    </div>
                    <div class="d-flex justify-content-center">
                        <button
                            v-if="isDrawingLineOrMeasure"
                            data-cy="drawing-delete-last-point-button"
                            class="m-1"
                            outline-danger
                            @click="$emit('deleteLastPoint')"
                        >
                            {{ $t('draw_button_delete_last_point') }}
                        </button>
                    </div>
                    <div
                        class="d-flex justify-content-center drawing-toolbox-drawing-state"
                        :class="{ 'text-danger': isDrawingStateError }"
                    >
                        {{ $t(drawingStateMessage) }}
                    </div>
                    <div class="d-flex justify-content-center">
                        <button
                            :disabled="isDrawingEmpty"
                            class="btn-light btn m-1"
                            data-cy="drawing-toolbox-delete-button"
                            @click="showClearConfirmation"
                        >
                            {{ $t('delete') }}
                        </button>
                        <DrawingExporter :is-drawing-empty="isDrawingEmpty" />
                        <button
                            type="button"
                            class="btn btn-light m-1"
                            :disabled="isDrawingEmpty || !kmlMetadata"
                            data-cy="drawing-toolbox-share-button"
                            @click="openShare"
                        >
                            {{ $t('share') }}
                        </button>
                    </div>
                    <!-- eslint-disable vue/no-v-html-->
                    <small
                        class="text-center text-muted drawing-toolbox-disclaimer"
                        v-html="$t('share_file_disclaimer')"
                    ></small>
                    <!-- eslint-enable vue/no-v-html-->
                </div>
            </div>
            <ButtonWithIcon
                class="m-auto button-open-close-draw-menu ps-4 pe-4"
                data-cy="menu-button"
                :button-font-awesome-icon="['fas', drawMenuOpen ? 'caret-up' : 'caret-down']"
                :button-title="$t(drawMenuOpen ? 'close_menu' : 'open_menu')"
                icons-before-text
                dark
                @click="drawMenuOpen = !drawMenuOpen"
            >
            </ButtonWithIcon>
        </div>
        <ModalWithBackdrop
            v-if="showClearConfirmationModal"
            show-confirmation-buttons
            fluid
            data-cy="drawing-toolbox-delete-confirmation-modal"
            @close="onCloseClearConfirmation"
        >
            {{ $t('confirm_remove_all_features') }}
        </ModalWithBackdrop>
        <ModalWithBackdrop v-if="showShareModal" fluid :title="$t('share')" @close="onCloseShare">
            <ShareForm :kml-metadata="kmlMetadata" />
        </ModalWithBackdrop>
    </teleport>
</template>

<script>
import { EditableFeatureTypes } from '@/api/features.api'
import DrawingExporter from '@/modules/drawing/components/DrawingExporter.vue'
import DrawingToolboxButton from '@/modules/drawing/components/DrawingToolboxButton.vue'
import ShareForm from '@/modules/drawing/components/SharePopup.vue'
import ButtonWithIcon from '@/utils/ButtonWithIcon.vue'
import ModalWithBackdrop from '@/utils/ModalWithBackdrop.vue'
import { mapGetters } from 'vuex'
import DrawingHeader from './DrawingHeader.vue'
import { DrawingState } from '../lib/export-utils'

export default {
    components: {
        DrawingExporter,
        ModalWithBackdrop,
        ButtonWithIcon,
        DrawingToolboxButton,
        ShareForm,
        DrawingHeader,
    },
    props: {
        kmlMetadata: {
            type: Object,
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
        /** Current kml saving status */
        drawingState: {
            type: String,
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
                    return 'draw_file_saving'
                case DrawingState.SAVED:
                    return 'draw_file_saved'
                case DrawingState.SAVE_ERROR:
                    return 'draw_file_load_error'
                case DrawingState.LOAD_ERROR:
                    return 'draw_file_save_error'
                default:
                    return ''
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
    &-close-button {
        position: absolute;
        top: 0;
        right: 0;
    }
    .button-open-close-draw-menu {
        height: $openCloseButtonHeight;
        display: none;

        border-top-left-radius: 0;
        border-top-right-radius: 0;
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
        &-close-button {
            display: none;
        }
        .button-open-close-draw-menu {
            display: block;
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
