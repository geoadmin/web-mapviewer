<template>
    <teleport to="#main-component">
        <!-- Must teleport inside main-component in order for dynamic outlines to work and to be
        sure that it is always on top of the reset. -->
        <div>
            <BlackBackdrop place-for-modal @click.stop="onClose()" />
            <div class="modal-popup position-absolute start-50 top-50 translate-middle">
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
import BlackBackdrop from '@/utils/components/BlackBackdrop.vue'

/**
 * Utility component that will wrap your modal content and make sure it is above the overlay of the
 * map
 */
export default {
    components: { BlackBackdrop },
    emits: ['close'],
    mounted() {
        this.printAndClose()
    },
    methods: {
        printAndClose() {
            window.print()
            this.$emit('close')
        },
    },
}
</script>

<style lang="scss" scoped>
@import '@/scss/variables.module';
@import '@/scss/media-query.mixin';

.modal-popup {
    z-index: $zindex-modal;
    .card {
        width: max-content;
        width: 100vw;
        display: inline-block;
        .card-body {
            overflow-y: auto;
        }
    }
}
</style>
