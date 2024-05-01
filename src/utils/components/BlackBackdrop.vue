<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const { withSpinner, placeForModal } = defineProps({
    withSpinner: {
        type: Boolean,
        default: false,
    },
    placeForModal: {
        type: Boolean,
        default: false,
    },
})
</script>

<template>
    <div
        class="black-backdrop position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-50"
        :class="{ 'modal-z-index': placeForModal }"
        data-cy="black-backdrop"
    >
        <div
            v-if="withSpinner"
            class="position-absolute start-50 top-50 translate-middle text-light"
        >
            <FontAwesomeIcon icon="spinner" spin size="4x" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/variables.module';

.black-backdrop {
    z-index: $zindex-map + 1;
    &.modal-z-index {
        z-index: $zindex-modal - 1;
    }
}
</style>
