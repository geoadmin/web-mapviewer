<script setup>
/**
 * Main component of the App.
 *
 * Will listen for screen size changes and commit this changes to the store
 */

import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { IS_TESTING_WITH_CYPRESS } from '@/config/staging.config'
import DebugToolbar from '@/modules/menu/components/debug/DebugToolbar.vue'
import FeedbackPopup from '@/utils/components/FeedbackPopup.vue'
import debounce from '@/utils/debounce'

const withOutline = ref(false)

const store = useStore()
const { t } = useI18n()

const dispatcher = { dispatcher: 'App.vue' }

let debouncedOnResize
const showFeedbackPopup = computed(() => {
    return store.state.ui.errors.size + store.state.ui.warnings.size > 0
})
const showDebugToolbar = computed(() => !IS_TESTING_WITH_CYPRESS && store.getters.hasDevSiteWarning)

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
    document.title = t('page_title')
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
        <FeedbackPopup v-if="showFeedbackPopup" />
        <DebugToolbar v-if="showDebugToolbar" />
    </div>
</template>

<!-- this style is not scoped in order to enable the distribution of bootstrap's
(or/and Tailwind's) CSS rules to the whole app (with a scoped style it would be limited to this component) -->
<style lang="scss" src="./scss/main.scss" />
