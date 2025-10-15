<script setup lang="ts">
import type { Map } from 'ol'

import log from '@swissgeo/log'
import MousePosition from 'ol/control/MousePosition'
import { computed, inject, nextTick, onMounted, onUnmounted, ref, useTemplateRef } from 'vue'

import getHumanReadableCoordinate from '@/modules/map/components/common/mouseTrackerUtils'
import type { ActionDispatcher } from '@/store/types'
import usePositionStore from '@/store/modules/position.store'
import { allFormats, LV95Format } from '@/utils/coordinates/coordinateFormat'

const dispatcher: ActionDispatcher = { name: 'OpenLayersMouseTracker.vue' }

const mousePosition = useTemplateRef<HTMLElement>('mousePosition')
const displayedFormatId = ref(LV95Format.id)

const positionStore = usePositionStore()
const projection = computed(() => positionStore.projection)

const olMap = inject<Map>('olMap')
if (!olMap) {
    log.error({ title: 'OpenLayersMouseTracker', message: 'OpenLayers map not found' })
}

let mousePositionControl: MousePosition | undefined

onMounted(() => {
    if (!olMap) return

    mousePositionControl = new MousePosition({
        className: 'mouse-position-inner',
    })
    mousePositionControl.setTarget(mousePosition.value!)
    olMap.addControl(mousePositionControl)
    // we wait for the next cycle to set the projection, otherwise the info can
    // sometimes be lost (and we end up with a different projection in the position display)
    void nextTick(() => {
        setDisplayedFormatWithId()
    })
})
onUnmounted(() => {
    if (mousePositionControl && olMap) {
        olMap.removeControl(mousePositionControl)
    }
})

function setDisplayedFormatWithId(): void {
    const displayedFormat = allFormats.find((format) => format.id === displayedFormatId.value)
    if (displayedFormat) {
        positionStore.setDisplayedFormat(displayedFormat, dispatcher)
    }
    if (displayedFormat && mousePositionControl) {
        mousePositionControl.setCoordinateFormat((coordinates) => {
            return getHumanReadableCoordinate({
                coordinates,
                displayedFormat,
                projection: projection.value,
            })
        })
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
