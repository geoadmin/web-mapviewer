<template>
    <portal to="toolbox-container">
        <div class="drawing-toolbox">
            <div class="card">
                <div class="card-body position-relative">
                    <ButtonWithIcon
                        class="position-absolute top-0 end-0"
                        data-cy="drawing-toolbox-close-button"
                        :button-font-awesome-icon="['fas', 'times']"
                        outline-light
                        @click="emitCloseEvent"
                    />
                    <div class="d-block">
                        <DrawingToolboxButton
                            v-for="drawingMode in drawingModes"
                            :key="drawingMode"
                            :drawing-mode="drawingMode"
                            :is-active="currentDrawingMode === drawingMode"
                            :data-cy="`drawing-toolbox-mode-button-${drawingMode}`"
                            class="m-1"
                            @setDrawingMode="bubbleSetDrawingEventToParent"
                        />
                    </div>
                    <div class="d-block">
                        <ButtonWithIcon
                            :button-font-awesome-icon="['far', 'trash-alt']"
                            :disabled="!drawingNotEmpty"
                            outline-light
                            class="m-1"
                            data-cy="drawing-toolbox-delete-button"
                            @click="showClearConfirmation"
                        />
                        <div class="btn-group m-1">
                            <button
                                :disabled="!drawingNotEmpty"
                                type="button"
                                class="btn btn-outline-light text-dark"
                                data-cy="drawing-toolbox-quick-export-button"
                                @click="emitExportEvent(false)"
                            >
                                {{ $t('export_kml') }}
                            </button>
                            <button
                                id="toggle-export-dropdown-options"
                                type="button"
                                :disabled="!drawingNotEmpty"
                                class="
                                    btn btn-outline-light
                                    text-dark
                                    dropdown-toggle dropdown-toggle-split
                                "
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                                data-cy="drawing-toolbox-choose-export-format-button"
                            >
                                <span class="visually-hidden">Toggle Dropdown</span>
                            </button>
                            <ul
                                class="dropdown-menu"
                                aria-labelledby="toggle-export-dropdown-options"
                            >
                                <li>
                                    <button
                                        class="dropdown-item"
                                        data-cy="drawing-toolbox-export-kml-button"
                                        @click="emitExportEvent(false)"
                                    >
                                        KML
                                    </button>
                                </li>
                                <li>
                                    <button
                                        class="dropdown-item"
                                        data-cy="drawing-toolbox-export-gpx-button"
                                        @click="emitExportEvent(true)"
                                    >
                                        GPX
                                    </button>
                                </li>
                            </ul>
                        </div>
                        <button
                            type="button"
                            class="btn btn-outline-light text-dark m-1"
                            :disabled="!drawingNotEmpty || !kmlIds"
                            data-cy="drawing-toolbox-share-button"
                            @click="openShare"
                        >
                            {{ $t('share') }}
                        </button>
                        <button
                            v-if="deleteLastPointCallback"
                            type="button"
                            data-cy="drawing-delete-last-point-button"
                            class="btn btn-outline-danger m-1"
                            @click="deleteLastPointCallback"
                        >
                            {{ $t('draw_button_delete_last_point') }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <ModalWithOverlay
            v-if="showClearConfirmationModal"
            show-confirmation-buttons
            data-cy="drawing-toolbox-delete-confirmation-modal"
            @close="onCloseClearConfirmation"
        >
            {{ $t('confirm_remove_all_features') }}
        </ModalWithOverlay>
        <ModalWithOverlay
            v-if="showShareModal"
            :title="$t('share')"
            data-cy="drawing-toolbox-share-modal"
            @close="onCloseShare"
        >
            <share-form :kml-ids="kmlIds" />
        </ModalWithOverlay>
    </portal>
</template>

<script>
import DrawingToolboxButton from '@/modules/drawing/components/DrawingToolboxButton'
import ShareForm from '@/modules/drawing/components/SharePopup'
import ButtonWithIcon from '@/utils/ButtonWithIcon'
import ModalWithOverlay from '@/modules/overlay/components/ModalWithOverlay'

export default {
    components: {
        ModalWithOverlay,
        ButtonWithIcon,
        DrawingToolboxButton,
        ShareForm,
    },
    props: {
        drawingModes: {
            type: Array,
            required: true,
        },
        kmlIds: {
            type: Object,
            default: null,
        },
        currentDrawingMode: {
            type: String,
            default: null,
        },
        drawingNotEmpty: {
            type: Boolean,
            default: false,
        },
        deleteLastPointCallback: {
            type: Function,
            default: undefined,
        },
    },
    data: function () {
        return {
            showExportDropdown: false,
            showShareModal: false,
            showClearConfirmationModal: false,
        }
    },
    methods: {
        emitCloseEvent: function () {
            this.$emit('close')
        },
        bubbleSetDrawingEventToParent: function (drawingMode) {
            this.$emit('setDrawingMode', drawingMode)
        },
        emitExportEvent: function (gpx = false) {
            this.showExportDropdown = false
            this.$emit('export', gpx)
        },
        toggleExportDropdown: function () {
            this.showExportDropdown = !this.showExportDropdown
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
        openShare: function () {
            this.showShareModal = true
        },
        showClearConfirmation: function () {
            this.showClearConfirmationModal = true
        },
    },
}
</script>
