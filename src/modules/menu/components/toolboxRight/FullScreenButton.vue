<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const isInFullScreenMode = computed(() => store.state.ui.fullscreenMode)
let count = 0

document.addEventListener('keydown', (e) => {
    if (e.key === 'w') {
        toggleFullScreen()
        counter()
    }
})

function counter() {
    count = count + 1
}

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
    <div>{{ count }}</div>
</template>

<style lang="scss" scoped>
@import 'src/modules/menu/scss/toolbox-buttons';
</style>
