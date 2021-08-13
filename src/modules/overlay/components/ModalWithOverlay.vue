<template>
    <portal to="modal-container">
        <div class="modal-popup">
            <div class="card">
                <div class="card-header">
                    <span v-if="title" class="float-start align-middle">{{ title }}</span>
                    <button class="float-right btn btn-sm" @click="onClose">
                        <font-awesome-icon :icon="['fa', 'times']" />
                    </button>
                    <span v-if="allowPrint" class="float-right mx-2" @click="printModalContent">
                        <font-awesome-icon :icon="['fa', 'print']" />
                    </span>
                </div>
                <div ref="modalContent" class="card-body p-0">
                    <slot />
                </div>
            </div>
        </div>
    </portal>
</template>

<style lang="scss">
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

<script>
import { mapActions } from 'vuex'
import promptUserToPrintHtmlContent from '@/utils/print'

/** Utility component that will wrap your modal content and make sure it is above the overlay of the map */
export default {
    props: {
        title: {
            type: String,
            default: null,
        },
        allowPrint: {
            type: Boolean,
            default: false,
        },
    },
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
            this.$emit('close')
            // stopping the overlay from closing and processing the callbacks after the one for this modal
            return true
        },
        onClose: function () {
            // it will go through preventOverlayToClose first and only remove our callback from the stack
            this.hideOverlay()
            this.$emit('close')
        },
        printModalContent: function () {
            if (this.$refs.modalContent) {
                promptUserToPrintHtmlContent(this.$refs.modalContent.outerHTML)
            }
        },
    },
}
</script>
