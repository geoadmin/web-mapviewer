<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import GeoadminTooltip from '@geoadmin/tooltip'
import { computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

const dispatcher = { dispatcher: 'FullScreenButton.vue' }

const { t } = useI18n()
const store = useStore()

const tooltipContent = computed(() => {
    if (isInFullScreenMode.value) {
        return t('full_screen_exit')
    }
    return t('full_screen')
})

const isInFullScreenMode = computed(() => store.state.ui.fullscreenMode)

function toggleFullScreen() {
    store.dispatch('toggleFullscreenMode', dispatcher)
}
const height = computed(() => store.state.ui.height)
const width = computed(() => store.state.ui.width)
const isInWindowFullScreenModeNotChromium = computed(
    () => screen.width === width.value && screen.height === height.value && !window.chrome
)
onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
})
onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
})

function handleKeydown(event) {
    if (event.key === 'Escape' && isInFullScreenMode.value) {
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
            :class="{ active: isInFullScreenMode }"
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
    animation: fadeInOut 3s ease-in-out forwards;
}

@keyframes fadeInOut {
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
