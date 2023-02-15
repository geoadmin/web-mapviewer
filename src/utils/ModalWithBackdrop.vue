<template>
    <teleport to="#main-component">
        <!-- Must teleport inside main-component in order for dynamic outlines to work and to be
        sure that it is always on top of the reset. -->
        <div>
            <BlackBackdrop class="modal-view" @click="onClose(false)" />
            <div class="modal-popup" :class="{ 'modal-popup-fluid': fluid }">
                <div
                    class="card"
                    :class="{
                        'border-primary': headerPrimary,
                    }"
                >
                    <div
                        class="card-header d-flex align-middle"
                        :class="{ 'bg-primary text-white border-primary': headerPrimary }"
                    >
                        <span v-if="title" class="flex-grow-1 text-start">{{ title }}</span>
                        <button
                            v-if="allowPrint"
                            class="btn btn-sm"
                            :class="{
                                'btn-light': !headerPrimary,
                                'btn-primary': headerPrimary,
                            }"
                            data-cy="modal-print-button"
                            @click="printModalContent"
                        >
                            <FontAwesomeIcon icon="print" />
                        </button>
                        <button
                            class="btn btn-sm"
                            :class="{
                                'btn-light': !headerPrimary,
                                'btn-primary': headerPrimary,
                            }"
                            data-cy="modal-close-button"
                            @click="onClose(false)"
                        >
                            <FontAwesomeIcon icon="times" />
                        </button>
                    </div>
                    <div ref="modalContent" class="card-body pt-3 ps-4 pe-4">
                        <slot />
                        <div v-if="showConfirmationButtons" class="mt-1 d-flex justify-content-end">
                            <button
                                class="btn btn-light me-2"
                                data-cy="modal-cancel-button"
                                @click="onClose(false)"
                            >
                                {{ $t('cancel') }}
                            </button>
                            <button
                                class="btn btn-primary"
                                data-cy="modal-confirm-button"
                                @click="onClose(true)"
                            >
                                {{ $t('success') }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </teleport>
</template>

<script>
import BlackBackdrop from '@/modules/menu/components/BlackBackdrop.vue'
import promptUserToPrintHtmlContent from '@/utils/print'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/**
 * Utility component that will wrap your modal content and make sure it is above the overlay of the
 * map
 */
export default {
    components: { FontAwesomeIcon, BlackBackdrop },
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
        fluid: {
            type: Boolean,
            default: false,
        },
        headerPrimary: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['close'],
    methods: {
        onClose(withConfirmation) {
            // it will go through preventOverlayToClose first and only remove our callback from the stack
            this.$emit('close', withConfirmation)
        },
        printModalContent() {
            if (this.$refs.modalContent) {
                promptUserToPrintHtmlContent(this.$refs.modalContent)
            }
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/variables';
@import 'src/scss/media-query.mixin';
.modal-popup {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    &:not(&-fluid) {
        // only setting a min-width if the modal content shouldn't be fluid
        min-width: 75vw;
    }
    z-index: $zindex-modal;
    max-height: 90vh;
    // For phone we set the width fixed to 95% of the view.
    width: 95vw;
    @include respond-above(phone) {
        // But for desktop we let the size be dynamic with max to 90% of the view
        width: unset;
        max-width: 90vw;
    }
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
