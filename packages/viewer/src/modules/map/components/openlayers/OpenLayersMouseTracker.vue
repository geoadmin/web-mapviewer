<script setup>
import log from '@swissgeo/log'
import MousePosition from 'ol/control/MousePosition'
import { computed, inject, nextTick, onMounted, onUnmounted, ref, useTemplateRef } from 'vue'
import { useStore } from 'vuex'

import getHumanReadableCoordinate from '@/modules/map/components/common/mouseTrackerUtils'
import allFormats, { LV95Format } from '@/utils/coordinates/coordinateFormat'

const dispatcher = { dispatcher: 'OpenLayersMouseTracker.vue' }

const mousePosition = useTemplateRef('mousePosition')
const displayedFormatId = ref(LV95Format.id)

const store = useStore()
const projection = computed(() => store.state.position.projection)

const olMap = inject('olMap')

let mousePositionControl

onMounted(() => {
    mousePositionControl = new MousePosition({
        className: 'mouse-position-inner',
        undefinedHTML: '&nbsp;',
    })
    mousePositionControl.setTarget(mousePosition.value)
    olMap.addControl(mousePositionControl)
    // we wait for the next cycle to set the projection, otherwise the info can
    // sometimes be lost (and we end up with a different projection in the position display)
    nextTick(() => {
        setDisplayedFormatWithId()
    })
})
onUnmounted(() => {
    olMap.removeControl(mousePositionControl)
})

function setDisplayedFormatWithId() {
    store.dispatch('setDisplayedFormatId', {
        displayedFormatId: displayedFormatId.value,
        ...dispatcher,
    })
    const displayedFormat = allFormats.find((format) => format.id === displayedFormatId.value)
    if (displayedFormat) {
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
