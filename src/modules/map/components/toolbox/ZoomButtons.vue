<script setup>
import { useStore } from 'vuex'

import { useTippyTooltip } from '@/utils/useTippyTooltip'

const dispatcher = { dispatcher: 'ZoomButtons.vue' }

const store = useStore()
useTippyTooltip('#zoomButtons [data-tippy-content]', { placement: 'left' })

function increaseZoom() {
    store.dispatch('increaseZoom', dispatcher)
}
function decreaseZoom() {
    store.dispatch('decreaseZoom', dispatcher)
}
</script>

<template>
    <div id="zoomButtons">
        <button
            class="toolbox-button d-print-none"
            data-cy="zoom-in"
            data-tippy-content="zoom_in"
            @click="increaseZoom"
        >
            <font-awesome-icon size="lg" :icon="['fas', 'plus-circle']" />
        </button>
        <button
            class="toolbox-button d-print-none"
            data-cy="zoom-out"
            data-tippy-content="zoom_out"
            @click="decreaseZoom"
        >
            <font-awesome-icon size="lg" :icon="['fas', 'minus-circle']" />
        </button>
    </div>
</template>

<style lang="scss" scoped>
@import '@/modules/map/scss/toolbox-buttons';
</style>
