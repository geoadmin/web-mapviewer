<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

interface Props {
    withSpinner?: boolean
    placeForModal?: boolean
}

withDefaults(defineProps<Props>(), {
    withSpinner: false,
    placeForModal: false,
})
</script>

<template>
    <div
        class="black-backdrop position-fixed w-100 h-100 start-0 top-0 bg-black bg-opacity-50"
        :class="{ 'modal-z-index': placeForModal }"
        data-cy="black-backdrop"
    >
        <div
            v-if="withSpinner"
            class="position-absolute start-50 top-50 translate-middle text-light"
        >
            <FontAwesomeIcon
                icon="spinner"
                spin
                size="4x"
            />
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
