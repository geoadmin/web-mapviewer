<script setup lang="ts">
import useCesiumStore from '@/store/modules/cesium.store'
import usePositionStore from '@/store/modules/position.store'
import GeoadminTooltip from '@swissgeo/tooltip'
import { Ray, Viewer } from 'cesium'
import { computed, inject } from 'vue'
import { useI18n } from 'vue-i18n'

const dispatcher = { name: 'ZoomButtons.vue' }

const { t } = useI18n()
const cesiumStore = useCesiumStore()
const positionStore = usePositionStore()

const is3dActive = computed(() => cesiumStore.active)
const resolution = computed(() => positionStore.resolution)

const getViewer = inject<() => Viewer | undefined>('getViewer', () => undefined, true)

const step = computed(() => resolution.value * 200)

function moveCamera(distance: number) {
    const viewer = getViewer()
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
    if (is3dActive.value) {
        moveCamera(step.value)
    } else {
        positionStore.increaseZoom(dispatcher)
    }
}

function decreaseZoom() {
    if (is3dActive.value) {
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
