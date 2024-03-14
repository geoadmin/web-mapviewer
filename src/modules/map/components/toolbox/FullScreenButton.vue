<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed } from 'vue'
import { useStore } from 'vuex'

import { useTippyTooltip } from '@/utils/useTippyTooltip'

const dispatcher = { dispatcher: 'FullScreenButton.vue' }

const store = useStore()

useTippyTooltip('#fullscreenButton[data-tippy-content]')

const isInFullScreenMode = computed(() => store.state.ui.fullscreenMode)

function toggleFullScreen() {
    store.dispatch('toggleFullscreenMode', dispatcher)
}
</script>

<template>
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
@import 'src/modules/map/scss/toolbox-buttons';
</style>
