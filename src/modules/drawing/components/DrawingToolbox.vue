<template>
    <teleport v-if="readyForTeleport" to=".drawing-toolbox-in-menu">
        <div class="drawing-toolbox">
            <div class="card text-center">
                <div class="card-body position-relative">
                    <ButtonWithIcon
                        class="position-absolute top-0 end-0"
                        data-cy="drawing-toolbox-close-button"
                        :button-font-awesome-icon="['fas', 'times']"
                        transparent
                        @click="emitCloseEvent"
                    />
                    <div class="d-flex justify-content-center">
                        <DrawingToolboxButton
                            v-for="drawingMode in drawingModes"
                            :key="drawingMode"
                            :drawing-mode="drawingMode"
                            :is-active="currentDrawingMode === drawingMode"
                            :ui-mode="uiMode"
                            :data-cy="`drawing-toolbox-mode-button-${drawingMode}`"
                            class="m-1"
                            @set-drawing-mode="bubbleSetDrawingEventToParent"
                        />
                    </div>
                    <div class="d-flex justify-content-center">
                        <ButtonWithIcon
                            :button-font-awesome-icon="['far', 'trash-alt']"
                            :disabled="isDrawingEmpty"
                            outline-light
                            class="m-1"
                            data-cy="drawing-toolbox-delete-button"
                            @click="showClearConfirmation"
                        />
                        <DrawingExporter />
                        <button
                            type="button"
                            class="btn btn-outline-light text-dark m-1"
                            :disabled="isDrawingEmpty || !kmlIds"
                            data-cy="drawing-toolbox-share-button"
                            @click="openShare"
                        >
                            {{ $t('share') }}
                        </button>
                        <ButtonWithIcon
                            v-if="isDrawingLineOrMeasure"
                            data-cy="drawing-delete-last-point-button"
                            class="m-1"
                            outline-danger
                            @click="$emit('deleteLastPoint')"
                        >
                            {{ $t('draw_button_delete_last_point') }}
                        </ButtonWithIcon>
                    </div>
                    <!-- eslint-disable vue/no-v-html-->
                    <small
                        class="d-none d-sm-block text-center text-muted"
                        v-html="$t('share_file_disclaimer')"
                    ></small>
                    <!-- eslint-enable vue/no-v-html-->
                </div>
            </div>
        </div>
        <ModalWithBackdrop
            v-if="showClearConfirmationModal"
            show-confirmation-buttons
            data-cy="drawing-toolbox-delete-confirmation-modal"
            @close="onCloseClearConfirmation"
        >
            {{ $t('confirm_remove_all_features') }}
        </ModalWithBackdrop>
        <ModalWithBackdrop
            v-if="showShareModal"
            :title="$t('share')"
            data-cy="drawing-toolbox-share-modal"
            @close="onCloseShare"
        >
            <ShareForm :kml-ids="kmlIds" />
        </ModalWithBackdrop>
    </teleport>
</template>

<script>
import DrawingExporter from '@/modules/drawing/components/DrawingExporter.vue'
import DrawingToolboxButton from '@/modules/drawing/components/DrawingToolboxButton.vue'
import ShareForm from '@/modules/drawing/components/SharePopup.vue'
import { DrawingModes } from '@/modules/store/modules/drawing.store'
import { UIModes } from '@/modules/store/modules/ui.store'
import ButtonWithIcon from '@/utils/ButtonWithIcon.vue'
import ModalWithBackdrop from '@/utils/ModalWithBackdrop.vue'

export default {
    components: {
        DrawingExporter,
        ModalWithBackdrop,
        ButtonWithIcon,
        DrawingToolboxButton,
        ShareForm,
    },
    props: {
        kmlIds: {
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
        uiMode: {
            type: String,
            default: UIModes.MENU_ALWAYS_OPEN,
        },
    },
    emits: ['close', 'setDrawingMode', 'export', 'clearDrawing', 'deleteLastPoint'],
    data() {
        return {
            drawingModes: Object.values(DrawingModes),
            showShareModal: false,
            showClearConfirmationModal: false,
            readyForTeleport: false,
        }
    },
    computed: {
        isDrawingLineOrMeasure() {
            return (
                this.currentDrawingMode === DrawingModes.LINEPOLYGON ||
                this.currentDrawingMode === DrawingModes.MEASURE
            )
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