<script setup lang="ts">
import useCesiumStore from '@/store/modules/cesium.store'
import usePositionStore from '@/store/modules/position.store'
import type { ActionDispatcher } from '@/store/types'
import GeoadminTooltip from '@swissgeo/tooltip'
import { Ray } from 'cesium'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { getCesiumViewer } from '@/modules/map/components/cesium/utils/viewerUtils'

const dispatcher: ActionDispatcher = { name: 'ZoomButtons.vue' }

const { t } = useI18n()
const cesiumStore = useCesiumStore()
const positionStore = usePositionStore()

const step = computed(() => positionStore.resolution * 200)

function moveCamera(distance: number) {
    const viewer = getCesiumViewer()
    const camera = viewer?.scene?.camera
    if (camera) {
        camera.flyTo({
            destination: Ray.getPoint(new Ray(camera.position, camera.direction), distance),
            orientation: {
                heading: camera.heading,
                pitch: camera.pitch,
                roll: camera.roll,
            },
            duration: 0.25,
        })
    }
}

function increaseZoom() {
    if (cesiumStore.active) {
        moveCamera(step.value)
    } else {
        positionStore.increaseZoom(dispatcher)
    }
}

function decreaseZoom() {
    if (cesiumStore.active) {
        moveCamera(-step.value)
    } else {
        positionStore.decreaseZoom(dispatcher)
    }
}
</script>

<template>
    <div id="zoomButtons">
        <GeoadminTooltip
            placement="left"
            :tooltip-content="t('zoom_in')"
        >
            <button
                ref="zoomInButton"
                class="toolbox-button d-print-none"
                data-cy="zoom-in"
                @click="increaseZoom"
            >
                <font-awesome-icon
                    size="lg"
                    :icon="['fas', 'plus-circle']"
                />
            </button>
        </GeoadminTooltip>
        <GeoadminTooltip
            placement="left"
            :tooltip-content="t('zoom_out')"
        >
            <button
                ref="zoomOutButton"
                class="toolbox-button d-print-none"
                data-cy="zoom-out"
                @click="decreaseZoom"
            >
                <font-awesome-icon
                    size="lg"
                    :icon="['fas', 'minus-circle']"
                />
            </button>
        </GeoadminTooltip>
    </div>
</template>

<style lang="scss" scoped>
@import '@/modules/map/scss/toolbox-buttons';
</style>
