<script setup>
import { ScreenSpaceEventHandler } from 'cesium'
import { ScreenSpaceEventType } from 'cesium'
import { Cartographic } from 'cesium'
import { Math } from 'cesium'
import { computed, inject, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { watch } from 'vue'
import { useStore } from 'vuex'

import allFormats, { LV03Format, LV95Format } from '@/utils/coordinates/coordinateFormat'
import log from '@/utils/logging'

const dispatcher = { dispatcher: 'CesiumMouseTracker.vue' }

const mousePosition = ref(null)
const displayedFormatId = ref(LV95Format.id)
let handler = null

const store = useStore()

const getViewer = inject('getViewer', () => {}, true)

const is3DReady = computed(() => store.state.cesium.isViewerReady)

watch(
    is3DReady,
    (newVal) => {
        if (newVal) {
            console.log('is3DReady is now true', getViewer())
            setupHandler()
        }
    },
    { immediate: true }
)

onMounted(() => {
    console.log('CesiumMouseTracker.vue onMounted', getViewer())
    nextTick(() => {
        setupHandler()
    })
})
onUnmounted(() => {
    if (handler) {
        handler.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE)
    }
})

function setupHandler() {
    console.log('Setup Handler')
    if (!getViewer()) {
        console.log('No viewer, canceling setupHandler')
        return
    }
    console.log('Viewer', getViewer())
    handler = new ScreenSpaceEventHandler(getViewer().scene.canvas)
    const viewer = getViewer()
    handler.setInputAction((movement) => {
        const ray = viewer.camera.getPickRay(movement.endPosition)
        const cartesian = viewer.scene.globe.pick(ray, viewer.scene)
        if (cartesian) {
            const cartographic = Cartographic.fromCartesian(cartesian)
            const longitude = Math.toDegrees(cartographic.longitude)
            const latitude = Math.toDegrees(cartographic.latitude)
            const height = cartographic.height
            mousePosition.value.textContent = `${longitude.toFixed(6)}, ${latitude.toFixed(6)}, ${height.toFixed(2)}`
        }
        // console.log('movement', movement)
    }, ScreenSpaceEventType.MOUSE_MOVE)
}

// function showCoordinateLabel(displayedFormat) {
//     return displayedFormat?.id === LV95Format.id || displayedFormat?.id === LV03Format.id
// }
function setDisplayedFormatWithId() {
    store.dispatch('setDisplayedFormatId', {
        displayedFormatId: displayedFormatId.value,
        ...dispatcher,
    })
    const displayedFormat = allFormats.find((format) => format.id === displayedFormatId.value)
    if (displayedFormat) {
        log.info('displayedFormat', displayedFormat)
    } else {
        log.error('Unknown coordinates display format', displayedFormatId.value)
    }
}
</script>

<template>
    <select
        v-model="displayedFormatId"
        class="map-projection form-control-xs"
        data-cy="mouse-position-select"
        @change="setDisplayedFormatWithId"
    >
        <option v-for="format in allFormats" :key="format.id" :value="format.id">
            {{ format.label }}
        </option>
    </select>
    <div ref="mousePosition" class="mouse-position" data-cy="mouse-position"></div>
</template>

<style lang="scss" scoped>
.mouse-position {
    display: none;
    min-width: 10em;
    text-align: left;
    white-space: nowrap;
}
@media (any-hover: hover) {
    .mouse-position {
        display: block;
    }
}
</style>
