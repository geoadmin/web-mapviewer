<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed, watch } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const height = computed(() => store.state.ui.height)
const width = computed(() => store.state.ui.width)
const isInFullScreenMode = computed(() => store.state.ui.fullscreenMode)
const isInWindowFullScreenMode = computed(
    () => screen.width == width.value && screen.height == height.value
)

watch(isInWindowFullScreenMode, () => {
    console.log('debug: flipped')
    if (isInWindowFullScreenMode.value != isInFullScreenMode.value) {
        toggleFullScreen()
    }
})

function toggleFullScreen() {
    store.dispatch('toggleFullscreenMode')
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
@import 'src/modules/menu/scss/toolbox-buttons';
</style>
