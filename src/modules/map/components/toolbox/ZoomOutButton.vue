<script setup>
import { useStore } from 'vuex'

import { useTippyTooltip } from '@/utils/useTippyTooltip'

const dispatcher = { dispatcher: 'ZoomOutButton.vue' }

const store = useStore()
useTippyTooltip('.zoom-button[data-tippy-content]', { placement: 'left' })

function decreaseZoom() {
    store.dispatch('decreaseZoom', dispatcher)
}
</script>

<template>
    <button
        class="toolbox-button zoom-button d-print-none"
        data-cy="zoom-out"
        data-tippy-content="zoom_out"
        @click="decreaseZoom"
    >
        <font-awesome-icon size="lg" :icon="['fas', 'minus-circle']" />
    </button>
</template>

<style lang="scss" scoped>
@import 'src/modules/map/scss/toolbox-buttons';
</style>
