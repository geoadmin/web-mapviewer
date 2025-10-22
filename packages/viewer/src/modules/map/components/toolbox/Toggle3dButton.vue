<script setup lang="ts">
import useCesiumStore from '@/store/modules/cesium'
import useDrawingStore from '@/store/modules/drawing'
import usePrintStore from '@/store/modules/print'
import type { ActionDispatcher } from '@/store/types'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import GeoadminTooltip from '@swissgeo/tooltip'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const dispatcher: ActionDispatcher = { name: 'Toggle3dButton.vue' }

const { t } = useI18n()
const cesiumStore = useCesiumStore()
const drawingStore = useDrawingStore()
const printStore = usePrintStore()
const tooltipContent = computed(() => {
    if (webGlIsSupported.value) {
        return t(`tilt3d_${cesiumStore.active ? 'active' : 'inactive'}`)
    }
    return t('3d_render_error')
})

const webGlIsSupported = ref(false)

onMounted(() => {
    webGlIsSupported.value = checkWebGlSupport()
})

function checkWebGlSupport(): boolean {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    return gl instanceof WebGLRenderingContext
}

function toggle3d() {
    if (webGlIsSupported.value && !drawingStore.drawingOverlay.show) {
        cesiumStore.set3dActive(!cesiumStore.active, dispatcher)
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
            :class="{
                active: cesiumStore.active,
                disabled: !webGlIsSupported || drawingStore.drawingOverlay.show,
            }"
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
