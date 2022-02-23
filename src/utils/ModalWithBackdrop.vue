<template>
    <teleport to="body">
        <BlackBackdrop front @click="onClose(false)" />
        <div class="modal-popup">
            <div class="card">
                <div class="card-header d-flex align-middle">
                    <span v-if="title" class="flex-grow-1 text-start">{{ title }}</span>
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
                        class="float-end"
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
import BlackBackdrop from '@/modules/menu/components/BlackBackdrop.vue'
import promptUserToPrintHtmlContent from '@/utils/print'
import ButtonWithIcon from '@/utils/ButtonWithIcon.vue'

/** Utility component that will wrap your modal content and make sure it is above the overlay of the map */
export default {
    components: { BlackBackdrop, ButtonWithIcon },
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
    methods: {
        onClose: function (withConfirmation) {
            // it will go through preventOverlayToClose first and only remove our callback from the stack
            this.$emit('close', withConfirmation)
        },
        printModalContent: function () {
            if (this.$refs.modalContent) {
                promptUserToPrintHtmlContent(this.$refs.modalContent)
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
    z-index: $zindex-modal;
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
