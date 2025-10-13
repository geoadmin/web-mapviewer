<script setup lang="ts">
import useCesiumStore from '@/store/modules/cesium.store'
import useDrawingStore from '@/store/modules/drawing.store'
import usePrintStore from '@/store/modules/print.store'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import GeoadminTooltip from '@swissgeo/tooltip'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const dispatcher = { name: 'Toggle3dButton.vue' }

const { t } = useI18n()
const cesiumStore = useCesiumStore()
const drawingStore = useDrawingStore()
const printStore = usePrintStore()
const tooltipContent = computed(() => {
    if (webGlIsSupported.value) {
        return t(`tilt3d_${isActive.value ? 'active' : 'inactive'}`)
    }
    return t('3d_render_error')
})

const webGlIsSupported = ref(false)
const isActive = computed(() => cesiumStore.active)
const showDrawingOverlay = computed(() => drawingStore.drawingOverlay.show)

onMounted(() => {
    webGlIsSupported.value = checkWebGlSupport()
})

function checkWebGlSupport(): boolean {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    return gl instanceof WebGLRenderingContext
}

function toggle3d() {
    if (webGlIsSupported.value && !showDrawingOverlay.value) {
        cesiumStore.set3dActive(!isActive.value, dispatcher)
        printStore.setPrintSectionShown(false, dispatcher)
    }
}
</script>

<template>
    <GeoadminTooltip
        placement="left"
        :tooltip-content="tooltipContent"
    >
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
    </GeoadminTooltip>
</template>

<style lang="scss" scoped>
@import '@/modules/map/scss/toolbox-buttons';
</style>
