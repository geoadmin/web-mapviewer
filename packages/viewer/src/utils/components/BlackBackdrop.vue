<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const { withSpinner = false, placeForModal = false } = defineProps<{
    withSpinner?: boolean
    placeForModal?: boolean
}>()
</script>

<template>
    <div
        class="black-backdrop position-fixed bg-opacity-50 start-0 top-0 h-100 w-100 bg-black"
        :class="{ 'modal-z-index': placeForModal }"
        data-cy="black-backdrop"
    >
        <div
            v-if="withSpinner"
            class="position-absolute translate-middle text-light start-50 top-50"
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
