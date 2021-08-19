<template>
    <portal to="modal-container">
        <div class="drawing-toolbox">
            <div class="card">
                <div class="card-body">
                    <button class="btn-close btn btn-default" @click="emitCloseEvent">
                        <font-awesome-icon :icon="['fas', 'times']" />
                    </button>
                    <div class="buttons-container">
                        <DrawingToolboxButton
                            v-for="drawingMode in drawingModes"
                            :key="drawingMode"
                            :drawing-mode="drawingMode"
                            :is-active="currentDrawingMode === drawingMode"
                            @setDrawingMode="bubbleSetDrawingEventToParent"
                        />
                        <br />
                        <div class="btn-group btn-group-sm draw-action-btns" role="group">
                            <button
                                type="button"
                                class="btn btn-outline-secondary"
                                :disabled="!drawingNotEmpty"
                                @click="showClearConfirmation"
                            >
                                {{ $t('draw_delete') }}
                            </button>
                            <div class="btn-group" role="group">
                                <button
                                    :disabled="!drawingNotEmpty"
                                    type="button"
                                    class="btn btn-outline-secondary dropdown-toggle export-btn"
                                    @click="toggleExportDropdown"
                                >
                                    {{ $t('export_kml') }}
                                </button>
                                <ul
                                    v-show="showExportDropdown && drawingNotEmpty"
                                    class="dropdown-menu export-menu"
                                >
                                    <li>
                                        <a class="dropdown-item" @click="emitExportEvent">KML</a>
                                    </li>
                                    <li>
                                        <a
                                            class="dropdown-item"
                                            @click="(event) => emitExportEvent(event, true)"
                                            >GPX</a
                                        >
                                    </li>
                                </ul>
                            </div>
                            <button
                                type="button"
                                class="btn btn-outline-secondary"
                                :disabled="!drawingNotEmpty || !kmlIds"
                                @click="openShare"
                            >
                                {{ $t('share') }}
                            </button>
                        </div>
                        <br />
                        <button
                            v-if="deleteLastPointCallback"
                            type="button"
                            data-cy="drawing-delete-last-point-button"
                            class="btn btn-outline-danger btn-sm delete-last-btn"
                            @click="deleteLastPointCallback"
                        >
                            {{ $t('draw_button_delete_last_point') }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <configurable-modal
            v-if="showClearConfirmationModal"
            title-tag="confirm_remove_all_features"
            :show-action-buttons="true"
            @close="onCloseClearConfirmation"
        ></configurable-modal>
        <configurable-modal v-if="showShareModal" title-tag="share" @close="onCloseShare">
            <share-form :kml-ids="kmlIds"></share-form>
        </configurable-modal>
    </portal>
</template>

<script>
import DrawingToolboxButton from '@/modules/drawing/components/DrawingToolboxButton'
import ConfigurableModal from '@/modules/helperComponents/ConfigurableModal'
import ShareForm from '@/modules/drawing/components/ShareForm'

export default {
    components: { DrawingToolboxButton, ConfigurableModal, ShareForm },
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
        emitExportEvent: function (event, gpx = false) {
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

<style lang="scss">
.drawing-toolbox {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;

    .btn-close {
        position: absolute;
        top: 0.25rem;
        right: 0.25rem;
    }
}

.buttons-container .draw-action-btns {
    width: 222px;
    margin-top: 10px;
}

.dropdown-menu.export-menu {
    width: 92px;
    display: block;
    min-width: auto;

    a {
        cursor: pointer;
    }
}

.delete-last-btn {
    margin-top: 5px;
}
</style>
