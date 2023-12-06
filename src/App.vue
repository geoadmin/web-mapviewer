<script setup>
/**
 * Main component of the App.
 *
 * Will listen for screen size changes and commit this changes to the store
 */

import { onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import debounce from '@/utils/debounce'

const withOutline = ref(false)

const store = useStore()
const i18n = useI18n()

let debouncedOnResize

onMounted(() => {
    // reading size
    setScreenSizeFromWindowSize()
    debouncedOnResize = debounce(setScreenSizeFromWindowSize, 300)
    window.addEventListener('resize', debouncedOnResize, { passive: true })
    refreshPageTitle()
})
onUnmounted(() => {
    window.removeEventListener('resize', debouncedOnResize)
})

function setScreenSizeFromWindowSize() {
    store.dispatch('setSize', {
        width: window.innerWidth,
        height: window.innerHeight,
    })
}
function refreshPageTitle() {
    document.title = i18n.t('page_title')
}
</script>

<template>
    <div
        id="main-component"
        :class="{ outlines: withOutline }"
        @keydown="withOutline = true"
        @pointerdown="withOutline = false"
    >
        <router-view />
    </div>
</template>

<style lang="scss">
// this style is not scoped in order to enable the distribution of bootstrap's
// CSS rules to the whole app (otherwise it would be limited to this component)
@import 'src/scss/webmapviewer-bootstrap-theme';
// this import needs to happen only once, otherwise bootstrap is import/added
// to the output CSS as many time as this file is imported
@import 'node_modules/bootstrap/scss/bootstrap';
// tippy-theme needs to be imported once and for the whole app in order to work
// properly therefore it is imported here in the un-scoped app styling.
@import 'src/scss/tippy-theme';

#main-component {
    font-family: $frutiger;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: $coal;
}

:focus {
    outline-style: none;
    .outlines & {
        outline-offset: 0;
        outline: $focus-outline;
    }
}
</style>
