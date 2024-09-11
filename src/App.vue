<script setup>
/**
 * Main component of the App.
 *
 * Will listen for screen size changes and commit this changes to the store
 */

import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import ErrorWindow from '@/utils/components/ErrorWindow.vue'
import WarningWindow from '@/utils/components/WarningWindow.vue'
import debounce from '@/utils/debounce'

const withOutline = ref(false)

const store = useStore()
const i18n = useI18n()

const dispatcher = { dispatcher: 'App.vue' }

let debouncedOnResize
const error = computed(() => {
    return store.state.ui.error
})
const warning = computed(() => {
    if (store.state.ui.warnings.size > 0) {
        return store.state.ui.warnings.values().next().value
    }
    return null
})

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
        ...dispatcher,
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
        <ErrorWindow
            v-if="error"
            title="error"
            @close="store.dispatch('setError', { error: null, ...dispatcher })"
        >
            <div>
                {{ i18n.t(error.msg, error.params) }}
            </div>
        </ErrorWindow>
        <WarningWindow
            v-if="warning"
            title="warning"
            @close="store.dispatch('removeWarning', { warning, ...dispatcher })"
        >
            <div>{{ i18n.t(warning.msg, warning.params) }}</div>
        </WarningWindow>
    </div>
</template>

<!-- this style is not scoped in order to enable the distribution of bootstrap's
CSS rules to the whole app (otherwise it would be limited to this component) -->
<style lang="scss" src="./scss/main.scss" />
