<script lang="ts" setup>
/**
 * Initial component of the App
 *
 * Will listen for screen size changes and commit this change to the store
 */

import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import type { ActionDispatcher } from '@/store/types'

import { IS_TESTING_WITH_CYPRESS } from '@/config/staging.config'
import DebugToolbar from '@/modules/menu/components/debug/DebugToolbar.vue'
import useAppStore from '@/store/modules/app'
import useLayersStore from '@/store/modules/layers'
import useUIStore, { MAP_LOADING_BAR_REQUESTER } from '@/store/modules/ui'
import FeedbackPopup from '@/utils/components/FeedbackPopup.vue'
import debounce from '@/utils/debounce'

const dispatcher: ActionDispatcher = { name: 'App.vue' }

const withOutline = ref<boolean>(false)

const { t } = useI18n()

const appStore = useAppStore()
const uiStore = useUIStore()
const layersStore = useLayersStore()

let debouncedOnResize: () => void = () => {}
const showFeedbackPopup = computed(() => {
    return uiStore.errors.size + uiStore.warnings.size > 0
})
const showDebugToolbar = computed(() => !IS_TESTING_WITH_CYPRESS && uiStore.hasDevSiteWarning)

onMounted(() => {
    // reading size at the start
    setScreenSizeFromWindowSize()
    debouncedOnResize = debounce(setScreenSizeFromWindowSize, 300)

    // initial load of layers config
    layersStore.loadLayersConfig(
        {
            changeLayersOnTopicChange:
                !window.location.hash.includes('layers=') &&
                !window.location.hash.includes('bgLayer='),
        },
        dispatcher
    )

    window.addEventListener('resize', debouncedOnResize, { passive: true })
    refreshPageTitle()
})
onUnmounted(() => {
    window.removeEventListener('resize', debouncedOnResize)
})

function setScreenSizeFromWindowSize() {
    uiStore.setSize(window.innerWidth, window.innerHeight, dispatcher)
}
function refreshPageTitle() {
    document.title = t('page_title')
}

watch(
    () => appStore.isMapReady,
    () => {
        if (uiStore.loadingBarRequesters[MAP_LOADING_BAR_REQUESTER]) {
            uiStore.clearLoadingBarRequester(MAP_LOADING_BAR_REQUESTER, dispatcher)
        }
    }
)
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
