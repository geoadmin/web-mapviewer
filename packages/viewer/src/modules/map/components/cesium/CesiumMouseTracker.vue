<script setup lang="js">
import { WGS84 } from '@swissgeo/coordinates'
import log from '@swissgeo/log'
import { round } from '@swissgeo/numbers'
import { Cartographic, Math, ScreenSpaceEventHandler, ScreenSpaceEventType } from 'cesium'
import proj4 from 'proj4'
import { computed, inject, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import getHumanReadableCoordinate from '@/modules/map/components/common/mouseTrackerUtils'
import allFormats, { LV95Format } from '@/utils/coordinates/coordinateFormat.js'

const mousePosition = useTemplateRef('mousePosition')
const displayedFormatId = ref(LV95Format.id)

const store = useStore()
const { t } = useI18n()

const is3DReady = computed(() => store.state.cesium.isViewerReady)
const projection = computed(() => store.state.position.projection)
const dispatcher = { dispatcher: 'CesiumMouseTracker.vue' }
const getViewer = inject('getViewer', () => undefined, true)

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
    setupHandler()
})
onBeforeUnmount(() => {
    if (handler) {
        handler.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE)
        handler.destroy()
    }
})

function setupHandler() {
    // If the handler already exists for some reason, there is no need to create it again
    if (handler || !getViewer()) {
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
            const coordinate = proj4(WGS84.epsg, projection.value.epsg, [longitude, latitude])
            coordinate.push(cartographic.height)

            mousePosition.value.textContent = formatCoordinate(coordinate)
        }
    }, ScreenSpaceEventType.MOUSE_MOVE)
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
        return `${getHumanReadableCoordinate({
            coordinates: [coordinate[0], coordinate[1]],
            projection: projection.value,
            displayedFormat,
        })}, ${t('elevation')}: ${round(coordinate[2], 2)} m`
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
        <option
            v-for="format in allFormats"
            :key="format.id"
            :value="format.id"
        >
            {{ format.label }}
        </option>
    </select>
    <div
        ref="mousePosition"
        class="mouse-position"
        data-cy="mouse-position"
    />
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
