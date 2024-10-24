<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed } from 'vue'
import { useStore } from 'vuex'

import { useTippyTooltip } from '@/utils/composables/useTippyTooltip'

const dispatcher = { dispatcher: 'FullScreenButton.vue' }

const store = useStore()

useTippyTooltip('#fullscreenButton[data-tippy-content]', { placement: 'left' })

const isInFullScreenMode = computed(() => store.state.ui.fullscreenMode)

function toggleFullScreen() {
    store.dispatch('toggleFullscreenMode', dispatcher)
}
const height = computed(() => store.state.ui.height)
const width = computed(() => store.state.ui.width)
const isInWindowFullScreenMode = computed(
    () => screen.width === width.value && screen.height === height.value
)
</script>

<template>
    <div v-if="isInWindowFullScreenMode" class="fullscreen-warning">
        To exit full screen press F11.
    </div>
    <button
        id="fullscreenButton"
        class="toolbox-button d-print-none"
        :class="{ active: isInFullScreenMode }"
        data-cy="toolbox-fullscreen-button"
        data-tippy-content="full_screen"
        @click="toggleFullScreen()"
    >
        <FontAwesomeIcon icon="expand" />
    </button>
</template>

<style lang="scss" scoped>
@import '@/modules/map/scss/toolbox-buttons';
.fullscreen-warning {
    position: fixed;
    top: 120px;
    left: 50%;
    transform: translateX(-50%);
    background-color: black;
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    font-size: 16px;
    z-index: 1000;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
    animation: fadeInOut 3s ease-in-out forwards;
}

@keyframes fadeInOut {
    0% {
        opacity: 0;
        visibility: visible;
    }
    10% {
        opacity: 0.9;
    }
    90% {
        opacity: 0.9;
    }
    100% {
        opacity: 0;
        visibility: hidden;
    }
}
</style>
