<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import GeoadminTooltip from '@swissgeo/tooltip'
import { computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

import type { ActionDispatcher } from '@/store/types'

import useUIStore from '@/store/modules/ui'

const dispatcher: ActionDispatcher = { name: 'FullScreenButton.vue' }

const { t } = useI18n()
const uiStore = useUIStore()

const tooltipContent = computed(() => {
    if (uiStore.fullscreenMode) {
        return t('full_screen_exit')
    }
    return t('full_screen')
})

function toggleFullScreen() {
    uiStore.toggleFullscreenMode(dispatcher)
}
const isInWindowFullScreenModeNotChromium = computed(
    () => screen.width === uiStore.width && screen.height === uiStore.height && !window.chrome
)
onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
})
onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
})

function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && uiStore.fullscreenMode) {
        toggleFullScreen()
    }
}
</script>

<template>
    <div
        v-if="isInWindowFullScreenModeNotChromium"
        class="fullscreen-warning"
    >
        {{ t('full_screen_window_exit') }}
    </div>
    <GeoadminTooltip
        :tooltip-content="tooltipContent"
        placement="left"
    >
        <button
            ref="fullscreenButton"
            class="toolbox-button d-print-none"
            :class="{ active: uiStore.fullscreenMode }"
            data-cy="toolbox-fullscreen-button"
            @click="toggleFullScreen()"
        >
            <FontAwesomeIcon icon="expand" />
        </button>
    </GeoadminTooltip>
</template>

<style lang="scss" scoped>
@import '@/modules/map/scss/toolbox-buttons';

.fullscreen-warning {
    position: fixed;
    top: 120px;
    left: 50%;
    transform: translateX(-50%);
    background-color: black;
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    font-size: 16px;
    z-index: 1000;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
    animation: fade-in-out 3s ease-in-out forwards;
}

@keyframes fade-in-out {
    0% {
        opacity: 0;
        visibility: visible;
    }

    10% {
        opacity: 0.9;
    }

    90% {
        opacity: 0.9;
    }

    100% {
        opacity: 0;
        visibility: hidden;
    }
}
</style>
