<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed } from 'vue'
import { useStore } from 'vuex'

const dispatcher = { dispatcher: 'FullScreenButton.vue' }

const store = useStore()
const isInFullScreenMode = computed(() => store.state.ui.fullscreenMode)

function toggleFullScreen() {
    store.dispatch('toggleFullscreenMode', dispatcher)
}
</script>

<template>
    <button
        class="toolbox-button d-print-none"
        :class="{ active: isInFullScreenMode }"
        data-cy="toolbox-fullscreen-button"
        @click="toggleFullScreen()"
    >
        <FontAwesomeIcon icon="expand" />
    </button>
</template>

<style lang="scss" scoped>
@import 'src/modules/map/scss/toolbox-buttons';
</style>
