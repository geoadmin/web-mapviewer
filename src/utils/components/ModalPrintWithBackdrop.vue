<template>
    <teleport to="#main-component">
        <!-- Must teleport inside main-component in order for dynamic outlines to work and to be
        sure that it is always on top of the reset. -->
        <div>
            <BlackBackdrop place-for-modal @click.stop="onClose()" />
            <div class="modal-popup position-absolute start-0 top-0 w-100 h-100">
                <div class="card">
                    <div ref="modalContent" class="card-body">
                        <slot />
                    </div>
                </div>
            </div>
        </div>
    </teleport>
</template>

<script>
import { nextTick } from 'vue'

import BlackBackdrop from '@/utils/components/BlackBackdrop.vue'

/**
 * Utility component that will wrap your modal content and make sure it is above the overlay of the
 * map
 */
export default {
    components: { BlackBackdrop },
    emits: ['close', 'hideParentModal'],
    mounted() {
        this.$emit('hideParentModal', true)
        const iframeList = this.$refs.modalContent.querySelectorAll('iframe')
        if (iframeList.length) {
            let pendingIframeCount = iframeList.length
            //wait for each iframe to be loaded before printing
            iframeList.forEach((iFrame) => {
                iFrame.onload = () => {
                    pendingIframeCount--
                    if (pendingIframeCount === 0) {
                        // wait for a short time for elements within the iframes to properly load
                        setTimeout(() => {
                            window.print()
                            this.$emit('hideParentModal', false)
                            this.$emit('close')
                        }, 500)
                    }
                }
            })
        } else {
            nextTick(() => {
                window.print()
                this.$emit('hideParentModal', false)
                this.$emit('close')
            })
        }
    },
}
</script>

<style lang="scss" scoped>
@import '@/scss/variables.module';
@import '@/scss/media-query.mixin';

.modal-popup {
    z-index: $zindex-modal;
    .card {
        width: 100%;
        display: flex;
        justify-content: stretch;
        .card-body {
            overflow-y: auto;
        }
    }
}
</style>
