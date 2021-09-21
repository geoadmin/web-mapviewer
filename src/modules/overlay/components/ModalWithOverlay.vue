<template>
    <teleport to="body">
        <div class="modal-popup">
            <div class="card">
                <div class="card-header d-flex">
                    <span v-if="title" class="align-middle flex-grow-1">{{ title }}</span>
                    <ButtonWithIcon
                        v-if="allowPrint"
                        small
                        :button-font-awesome-icon="['fa', 'print']"
                        data-cy="modal-print-button"
                        @click="printModalContent"
                    />
                    <ButtonWithIcon
                        :button-font-awesome-icon="['fa', 'times']"
                        small
                        data-cy="modal-close-button"
                        @click="onClose(false)"
                    />
                </div>
                <div ref="modalContent" class="card-body p-2">
                    <slot />
                    <div v-if="showConfirmationButtons" class="mt-1 d-flex justify-content-end">
                        <ButtonWithIcon
                            :button-title="$t('cancel')"
                            class="me-1"
                            data-cy="modal-cancel-button"
                            @click="onClose(false)"
                        />
                        <ButtonWithIcon
                            :button-title="$t('success')"
                            primary
                            data-cy="modal-confirm-button"
                            @click="onClose(true)"
                        />
                    </div>
                </div>
            </div>
        </div>
    </teleport>
</template>

<script>
import { mapActions } from 'vuex'
import promptUserToPrintHtmlContent from '@/utils/print'
import ButtonWithIcon from '@/utils/ButtonWithIcon'

/** Utility component that will wrap your modal content and make sure it is above the overlay of the map */
export default {
    components: { ButtonWithIcon },
    props: {
        title: {
            type: String,
            default: null,
        },
        allowPrint: {
            type: Boolean,
            default: false,
        },
        showConfirmationButtons: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['close'],
    mounted() {
        this.showOverlay(this.preventOverlayToClose)
        this.setOverlayShouldBeFront(true)
    },
    beforeDestroy() {
        this.setOverlayShouldBeFront(false)
    },
    methods: {
        ...mapActions(['showOverlay', 'setOverlayShouldBeFront', 'hideOverlay']),
        // will be used as a callback for the overlay
        preventOverlayToClose: function () {
            this.$emit('close', false)
            // stopping the overlay from closing and processing the callbacks after the one for this modal
            return true
        },
        onClose: function (withConfirmation) {
            // it will go through preventOverlayToClose first and only remove our callback from the stack
            this.hideOverlay()
            this.$emit('close', withConfirmation)
        },
        printModalContent: function () {
            if (this.$refs.modalContent) {
                promptUserToPrintHtmlContent(this.$refs.modalContent.outerHTML)
            }
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/variables';
.modal-popup {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: $zindex-overlay-front + 1;
    min-width: 75vw;
    max-width: 90vw;
    max-height: 90vh;
    .card {
        max-height: 90vh;
        .card-header {
            align-items: center;
            display: flex;
            .btn {
                margin-left: auto;
            }
        }
        .card-body {
            overflow-y: auto;
            a {
                text-decoration: underline;
                color: #069;
            }
        }
    }
}
</style>
