<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import tippy from 'tippy.js'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

const dispatcher = { dispatcher: 'Toggle3dButton.vue' }

const store = useStore()
const i18n = useI18n()

let tooltip = null

const toggle3dButton = ref(null)

const webGlIsSupported = ref(false)

const isActive = computed(() => store.state.cesium.active)
const currentLang = computed(() => store.state.i18n.lang)
const showDrawingOverlay = computed(() => store.state.ui.showDrawingOverlay)
const tooltipContent = computed(() => {
    if (webGlIsSupported.value) {
        return i18n.t(`tilt3d_${isActive.value ? 'active' : 'inactive'}`)
    }
    return i18n.t('3d_render_error')
})

watch(isActive, () => {
    updateTooltipContent()
})

watch(currentLang, () => {
    updateTooltipContent()
})

onMounted(() => {
    webGlIsSupported.value = checkWebGlSupport()
    tooltip = tippy(toggle3dButton.value, {
        theme: 'primary',
        content: tooltipContent.value,
        arrow: true,
        placement: 'left',
        touch: false,
    })
})

onBeforeUnmount(() => {
    tooltip?.destroy()
})

/**
 * Returns true if WebGL is supported by the browser / hardware.
 *
 * Copied from https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/By_example/Detect_WebGL
 *
 * @returns {boolean}
 */
function checkWebGlSupport() {
    // Create canvas element. The canvas is not added to the
    // document itself, so it is never displayed in the
    // browser window.
    const canvas = document.createElement('canvas')

    // Get WebGLRenderingContext from canvas element.
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

    return gl instanceof WebGLRenderingContext
}

function toggle3d() {
    if (webGlIsSupported.value && !showDrawingOverlay.value) {
        store.dispatch('set3dActive', { active: !isActive.value, ...dispatcher })
    }
}

function updateTooltipContent() {
    tooltip?.setContent(tooltipContent.value)
}
</script>

<template>
    <button
        ref="toggle3dButton"
        class="toolbox-button"
        type="button"
        :class="{ active: isActive, disabled: !webGlIsSupported || showDrawingOverlay }"
        data-cy="3d-button"
        @click="toggle3d"
    >
        <FontAwesomeIcon :icon="['fas', 'cube']" flip="horizontal" />
    </button>
</template>

<style lang="scss" scoped>
@import 'src/modules/map/scss/toolbox-buttons';
</style>
