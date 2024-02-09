<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed, ref } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const isInFullScreenMode = computed(() => store.state.ui.fullscreenMode)
let isInBrowserFullScreenMode

const count = ref(0)

document.addEventListener('keyup', (e) => {
    if (e.key === 'F11') {
        setTimeout(() => {
            isInBrowserFullScreenMode = window.innerHeight == screen.height && window.innerWidth == screen.width
            console.log('debug: ', isInFullScreenMode.value, isInBrowserFullScreenMode)
            console.log(
                'debug: ',
                window.innerHeight,
                screen.height,
                window.innerWidth,
                screen.width,
                window.innerHeight == screen.height && window.innerWidth == screen.width
            )
            if (isInFullScreenMode.value != isInBrowserFullScreenMode) {
                toggleFullScreen()
                counter()
            }
        }, 1000)
    }
})

function counter() {
    count.value = count.value + 1
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
    <button @click="counter">{{ count }}</button>
</template>

<style lang="scss" scoped>
@import 'src/modules/menu/scss/toolbox-buttons';
</style>
