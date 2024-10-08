<template>
    <teleport to="#main-component">
        <!-- Must teleport inside main-component in order for dynamic outlines to work and to be
        sure that it is always on top of the reset. -->
        <div v-show="!hide && !hideForPrint" data-cy="modal-with-backdrop">
            <BlackBackdrop v-if="useBlackBackDrop" place-for-modal @click.stop="onClose(false)" />
            <div
                ref="modalRef"
                class="modal-popup position-fixed start-50"
                :class="{
                    'top-50 translate-middle': !top,
                    'translate-middle-x on-top-with-padding': top,
                }"
            >
                <div
                    class="card"
                    :class="{
                        'border-primary': headerPrimary,
                        'modal-popup-fluid': fluid,
                        'modal-popup-compact': compact,
                    }"
                >
                    <div
                        ref="modalHeader"
                        class="card-header d-flex align-middle"
                        :class="{ 'bg-primary text-white border-primary': headerPrimary }"
                    >
                        <span
                            v-if="title"
                            class="flex-grow-1 text-start text-truncate"
                            data-cy="modal-with-backdrop-title"
                            >{{ title }}</span
                        >
                        <PrintButton
                            v-if="allowPrint && showContent"
                            :content="$refs.modalContent"
                            @hide-parent-modal="onHideParentModal"
                        ></PrintButton>
                        <button
                            v-if="allowMinimize"
                            class="btn btn-sm btn-light d-flex align-items-center"
                            data-cy="modal-minimize-button"
                            @click="showContent = !showContent"
                            @mousedown.stop=""
                        >
                            <FontAwesomeIcon :icon="`caret-${showContent ? 'up' : 'down'}`" />
                        </button>
                        <button
                            class="btn btn-sm d-flex align-items-center"
                            :class="{
                                'btn-light': !headerPrimary,
                                'btn-primary': headerPrimary,
                            }"
                            data-cy="modal-close-button"
                            @click.stop="onClose(false)"
                        >
                            <FontAwesomeIcon icon="times" />
                        </button>
                    </div>
                    <div
                        v-show="showContent"
                        ref="modalContent"
                        class="card-body pt-3 ps-4 pe-4"
                        data-cy="modal-content"
                    >
                        <slot />
                        <div v-if="showConfirmationButtons" class="mt-1 d-flex justify-content-end">
                            <button
                                class="btn btn-light me-2"
                                data-cy="modal-cancel-button"
                                @click.stop="onClose(false)"
                            >
                                {{ $t('cancel') }}
                            </button>
                            <button
                                class="btn btn-primary"
                                data-cy="modal-confirm-button"
                                @click.stop="onClose(true)"
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
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import BlackBackdrop from '@/utils/components/BlackBackdrop.vue'
import PrintButton from '@/utils/components/PrintButton.vue'
import log from '@/utils/logging'

import { useMovableElement } from '../composables/useMovableElement.composable'

/**
 * Utility component that will wrap your modal content and make sure it is above the overlay of the
 * map
 */
export default {
    components: { FontAwesomeIcon, BlackBackdrop, PrintButton },
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
        top: {
            type: Boolean,
            default: false,
        },
        /**
         * Hide the modal with backdrop, can be used to temporarily hide the modal without loosing
         * its content
         */
        hide: {
            type: Boolean,
            default: false,
        },
        movable: {
            type: Boolean,
            default: false,
        },
        useBlackBackdrop: {
            type: Boolean,
            default: true,
        },
        allowMinimize: {
            type: Boolean,
            default: false,
        },
        compact: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['close'],
    data() {
        return {
            hideForPrint: false,
            showContent: true,
        }
    },
    mounted() {
        if (this.movable) {
            const modalElement = this.$refs.modalRef
            if (modalElement) {
                useMovableElement(modalElement, {
                    grabElement: this.$refs.modalHeader,
                    initialPositionClasses: [
                        'start-50',
                        'top-50',
                        'translate-middle',
                        'translate-middle-x',
                        'on-top-with-padding',
                    ],
                })
            } else {
                log.error('Modal element not found')
            }
        }
    },
    methods: {
        onClose(withConfirmation) {
            // it will go through preventOverlayToClose first and only remove our callback from the stack
            this.$emit('close', withConfirmation)
        },
        onHideParentModal(hide) {
            this.hideForPrint = hide
        },
    },
}
</script>

<style lang="scss" scoped>
@import '@/scss/variables.module';
@import '@/scss/media-query.mixin';

.on-top-with-padding {
    top: $card-spacer-y !important;
}

.modal-popup {
    z-index: $zindex-modal;
    .card {
        width: max-content;
        max-width: 100vw;
        // dvh takes into account the user interface in mobile browsers (with vh part of the modal is
        // not visible if ui is shown). Is recognized by browsers from 2022 or newer. If the browser
        // is older, 90vh will normally be used, which is a bit less clean but good enough.
        max-height: 90vh;
        max-height: 100dvh;

        &:not(.modal-popup-fluid) {
            // only setting a width if the modal content shouldn't be fluid
            width: 80vw;
            @include respond-below(phone) {
                width: 100vw;
                border-radius: unset;
            }
        }
        @include respond-above(phone) {
            // But for desktop we let the size be dynamic with max to 90% of the view
            max-width: 80vw;
            max-height: 90svh;

            &.modal-popup-compact {
                width: 20vw;
            }
        }
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
