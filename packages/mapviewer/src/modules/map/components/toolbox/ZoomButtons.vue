<script setup>
import { Ray } from 'cesium'
import { computed, inject } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import GeoadminTooltip from '@/utils/components/GeoadminTooltip.vue'

const dispatcher = { dispatcher: 'ZoomButtons.vue' }

const store = useStore()
const { t } = useI18n()
const is3dActive = computed(() => store.state.cesium.active)
const resolution = computed(() => store.getters.resolution)

// telling vue that getViewer is a factory method (avoid unnecessary computation or side effects)
const getViewer = inject('getViewer', () => {}, true)

// The `step` variable is used with the 3D viewer. The goal was to find an increase or
// decrease in the zoom that emulated a zoom level in an agreeable way. `200` here is a
// magic number, found empirically, to achieve that goal.
const step = computed(() => resolution.value * 200)

function moveCamera(distance) {
    const camera = getViewer().scene?.camera
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
        store.dispatch('increaseZoom', dispatcher)
    }
}
function decreaseZoom() {
    if (is3dActive.value) {
        moveCamera(-step.value)
    } else {
        store.dispatch('decreaseZoom', dispatcher)
    }
}
</script>

<template>
    <div id="zoomButtons">
        <GeoadminTooltip placement="left">
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
            <template #content>
                <div class="whitespace-nowrap zoom-tooltip">{{ t('zoom_in') }}</div>
            </template>
        </GeoadminTooltip>
        <GeoadminTooltip placement="left">
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
            <template #content>
                <div class="whitespace-nowrap zoom-tooltip">{{ t('zoom_out') }}</div>
            </template>
        </GeoadminTooltip>
    </div>
</template>

<style lang="scss" scoped>
@import '@/modules/map/scss/toolbox-buttons';

.zoom-tooltip {
    padding: 6px 10px;
}
</style>
