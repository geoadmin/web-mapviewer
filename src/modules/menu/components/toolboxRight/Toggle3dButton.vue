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
<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import tippy from 'tippy.js'
import { mapActions, mapState } from 'vuex'

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

export default {
    components: { FontAwesomeIcon },
    data() {
        return {
            webGlIsSupported: false,
        }
    },
    computed: {
        ...mapState({
            isActive: (state) => state.cesium.active,
            currentLang: (state) => state.i18n.lang,
            showDrawingOverlay: (state) => state.ui.showDrawingOverlay,
        }),
        tooltipContent() {
            if (this.webGlIsSupported) {
                return this.$t(`tilt3d_${this.isActive ? 'active' : 'inactive'}`)
            }
            return this.$t('3d_render_error')
        },
    },
    watch: {
        isActive() {
            this.updateTooltipContent()
        },
        currentLang() {
            this.updateTooltipContent()
        },
    },
    mounted() {
        this.webGlIsSupported = checkWebGlSupport()
        this.tooltip = tippy(this.$refs.toggle3dButton, {
            theme: 'primary',
            content: this.tooltipContent,
            arrow: true,
            placement: 'left',
            touch: false,
        })
    },
    beforeUnmount() {
        this.tooltip.destroy()
    },
    methods: {
        ...mapActions(['set3dActive']),
        toggle3d() {
            if (this.webGlIsSupported && !this.showDrawingOverlay) {
                this.set3dActive({ active: !this.isActive, dispatcher: 'Toggle3dButton.vue' })
            }
        },
        updateTooltipContent() {
            if (this.tooltip) {
                this.tooltip.setContent(this.tooltipContent)
            }
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/modules/menu/scss/toolbox-buttons';
</style>
