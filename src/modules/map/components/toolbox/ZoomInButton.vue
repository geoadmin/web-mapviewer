<script setup>
import { useStore } from 'vuex'

import { useTippyTooltip } from '@/utils/useTippyTooltip'

const dispatcher = { dispatcher: 'ZoomOutButton.vue' }

const store = useStore()
useTippyTooltip('.zoom-in-button[data-tippy-content]', { placement: 'left' })

function increaseZoom() {
    store.dispatch('increaseZoom', dispatcher)
}
</script>

<template>
    <button
        class="toolbox-button zoom-in-button d-print-none"
        data-cy="zoom-in"
        data-tippy-content="zoom_in"
        @click="increaseZoom"
    >
        <font-awesome-icon size="lg" :icon="['fas', 'plus-circle']" />
    </button>
</template>

<style lang="scss" scoped>
@import 'src/modules/map/scss/toolbox-buttons';
</style>
