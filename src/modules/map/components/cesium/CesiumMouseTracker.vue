<script setup>
import { Cartographic, Math, ScreenSpaceEventHandler, ScreenSpaceEventType } from 'cesium'
import proj4 from 'proj4'
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import allFormats, { LV03Format, LV95Format } from '@/utils/coordinates/coordinateFormat'
import log from '@/utils/logging'

const mousePosition = ref(null)
const displayedFormatId = ref(LV95Format.id)

const store = useStore()
const i18n = useI18n()

const is3DReady = computed(() => store.state.cesium.isViewerReady)
const projection = computed(() => store.state.position.projection)

const dispatcher = { dispatcher: 'CesiumMouseTracker.vue' }
const getViewer = inject('getViewer', () => {}, true)

let handler = null

watch(
    is3DReady,
    (newValue) => {
        if (newValue) {
            setupHandler()
        }
    },
    { immediate: true }
)

onMounted(() => {
    nextTick(() => {
        setupHandler()
    })
})

onBeforeUnmount(() => {
    if (handler) {
        handler.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE)
        handler.destroy()
    }
})

function setupHandler() {
    if (!getViewer()) {
        return
    }
    handler = new ScreenSpaceEventHandler(getViewer().scene.canvas)
    const viewer = getViewer()
    handler.setInputAction((movement) => {
        const ray = viewer.camera.getPickRay(movement.endPosition)
        const cartesian = viewer.scene.globe.pick(ray, viewer.scene)
        if (cartesian) {
            const cartographic = Cartographic.fromCartesian(cartesian)
            const longitude = Math.toDegrees(cartographic.longitude)
            const latitude = Math.toDegrees(cartographic.latitude)
            let coordinate = proj4('EPSG:4326', projection.value.getCode(), [longitude, latitude])
            coordinate.push(cartographic.height)

            mousePosition.value.textContent = formatCoordinate(coordinate)
        }
    }, ScreenSpaceEventType.MOUSE_MOVE)
}

function showCoordinateLabel(displayedFormat) {
    return displayedFormat?.id === LV95Format.id || displayedFormat?.id === LV03Format.id
}

function setDisplayedFormatWithId() {
    store.dispatch('setDisplayedFormatId', {
        displayedFormatId: displayedFormatId.value,
        ...dispatcher,
    })
}

function formatCoordinate(coordinate) {
    const displayedFormat = allFormats.find((format) => format.id === displayedFormatId.value)
    if (displayedFormat) {
        if (showCoordinateLabel(displayedFormat)) {
            return `${i18n.t('coordinates_label')} ${displayedFormat.format(
                coordinate,
                projection.value
            )}`
        }
        return displayedFormat.format(coordinate, projection.value, true)
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
