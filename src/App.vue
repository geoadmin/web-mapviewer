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

<!-- this style is not scoped in order to enable the distribution of bootstrap's
CSS rules to the whole app (otherwise it would be limited to this component) -->
<style lang="scss" src="./scss/main.scss" />
