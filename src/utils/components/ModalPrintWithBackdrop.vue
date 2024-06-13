<script setup>
/** Utility component that will wrap modal content and hide everything else to make a clean print */
import { nextTick, onMounted, ref } from 'vue'

import BlackBackdrop from '@/utils/components/BlackBackdrop.vue'

const emits = defineEmits(['close', 'hideParentModal'])

const modalContent = ref(null)

onMounted(() => {
    emits('hideParentModal', true)
    const iframeList = modalContent.value.querySelectorAll('iframe')
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
                        emits('hideParentModal', false)
                        emits('close')
                    }, 500)
                }
            }
        })
    } else {
        nextTick(() => {
            window.print()
            emits('hideParentModal', false)
            emits('close')
        })
    }
})
</script>

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
