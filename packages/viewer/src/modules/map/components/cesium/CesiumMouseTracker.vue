<script setup lang="ts">
import { WGS84 } from '@swissgeo/coordinates'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import { round } from '@swissgeo/numbers'
import {
    Cartesian2,
    Cartographic,
    Math,
    ScreenSpaceEventHandler,
    ScreenSpaceEventType,
    type Viewer,
} from 'cesium'
import proj4 from 'proj4'
import { computed, inject, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import type { ActionDispatcher } from '@/store/types'

import useCesiumStore from '@/store/modules/cesium'
import usePositionStore from '@/store/modules/position'
import coordinateFormat, {
    allFormats,
    type CoordinateFormat,
    LV95Format,
} from '@/utils/coordinates/coordinateFormat'

const mousePosition = useTemplateRef<HTMLDivElement>('mousePosition')
const displayedFormatId = ref(LV95Format.id)

const cesiumStore = useCesiumStore()
const positionStore = usePositionStore()
const { t } = useI18n()

const is3DReady = computed(() => cesiumStore.isViewerReady)
const dispatcher: ActionDispatcher = { name: 'CesiumMouseTracker.vue' }

let handler: ScreenSpaceEventHandler | undefined

const viewer = inject<Viewer | undefined>('viewer')
if (!viewer) {
    log.error({
        title: 'CesiumMouseTracker.vue',
        titleColor: LogPreDefinedColor.Red,
        message: ['Viewer is not defined', 'CesiumMouseTracker.vue: viewer cannot be initialized'],
    })
    throw new Error('CesiumMouseTracker.vue: viewer is not defined')
}

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

function setupHandler(): void {
    // If the handler already exists for some reason, there is no need to create it again
    if (handler || !viewer) {
        return
    }
    handler = new ScreenSpaceEventHandler(viewer.scene.canvas)
    handler.setInputAction((movement: { endPosition: Cartesian2 }) => {
        const ray = viewer.camera.getPickRay(movement.endPosition)
        if (!ray) {
            return
        }
        const cartesian = viewer.scene.globe.pick(ray, viewer.scene)
        if (cartesian) {
            const cartographic = Cartographic.fromCartesian(cartesian)
            const longitude = Math.toDegrees(cartographic.longitude)
            const latitude = Math.toDegrees(cartographic.latitude)
            const projected = proj4(WGS84.epsg, positionStore.projection.epsg, [
                longitude,
                latitude,
            ])
            const coordinate: [number, number, number] = [
                projected[0] as number,
                projected[1] as number,
                cartographic.height ?? 0,
            ]

            if (mousePosition.value) {
                mousePosition.value.textContent = formatCoordinate(coordinate) ?? ''
            }
        }
    }, ScreenSpaceEventType.MOUSE_MOVE)
}

function setDisplayedFormatWithId(): void {
    const format = allFormats.find((format) => format.id === displayedFormatId.value)
    if (format) {
        positionStore.setDisplayedFormat(format, dispatcher)
    }
}

function formatCoordinate(coordinate: [number, number, number]): string | undefined {
    const displayedFormat: CoordinateFormat | undefined = allFormats.find(
        (format) => format.id === displayedFormatId.value
    )
    if (displayedFormat) {
        const humanReadable = coordinateFormat(
            displayedFormat,
            [coordinate[0], coordinate[1]],
            positionStore.projection
        )
        return `${humanReadable}, ${t('elevation')}: ${round(coordinate[2] ?? 0, 2)} m`
    } else {
        log.error({
            title: 'CesiumMouseTracker.vue',
            titleColor: LogPreDefinedColor.Red,
            message: ['Unknown coordinates display format', displayedFormatId.value],
        })
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
