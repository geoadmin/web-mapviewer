<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed, onMounted, ref, useTemplateRef } from 'vue'
import { useStore } from 'vuex'

import { useTippyTooltip } from '@/utils/composables/useTippyTooltip'

const dispatcher = { dispatcher: 'Toggle3dButton.vue' }

const store = useStore()

const toggle3DButton = useTemplateRef('toggle3DButton')
const tooltipContent = computed(() => {
    if (webGlIsSupported.value) {
        return `tilt3d_${isActive.value ? 'active' : 'inactive'}`
    }
    return '3d_render_error'
})
useTippyTooltip(toggle3DButton, tooltipContent, { placement: 'left' })

const webGlIsSupported = ref(false)

const isActive = computed(() => store.state.cesium.active)
const showDrawingOverlay = computed(() => store.state.drawing.drawingOverlay.show)

onMounted(() => {
    webGlIsSupported.value = checkWebGlSupport()
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
        // Hide print section when 3D is activated
        store.dispatch('setPrintSectionShown', { show: false, ...dispatcher })
    }
}
</script>

<template>
    <button
        ref="toggle3DButton"
        class="toolbox-button"
        type="button"
        :class="{ active: isActive, disabled: !webGlIsSupported || showDrawingOverlay }"
        data-cy="3d-button"
        @click="toggle3d"
    >
        <FontAwesomeIcon
            :icon="['fas', 'cube']"
            flip="horizontal"
        />
    </button>
</template>

<style lang="scss" scoped>
@import '@/modules/map/scss/toolbox-buttons';
</style>
