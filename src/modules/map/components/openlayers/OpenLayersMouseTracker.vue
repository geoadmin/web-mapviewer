<script setup>
import MousePosition from 'ol/control/MousePosition'
import { computed, inject, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import allFormats, { LV03Format, LV95Format } from '@/utils/coordinates/coordinateFormat'
import log from '@/utils/logging'

const mousePosition = ref(null)
const displayedFormatId = ref(LV95Format.id)

const store = useStore()
const projection = computed(() => store.state.position.projection)

const i18n = useI18n()

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

function showCoordinateLabel(displayedFormat) {
    return displayedFormat?.id === LV95Format.id || displayedFormat?.id === LV03Format.id
}
function setDisplayedFormatWithId() {
    store.dispatch('setDisplayedFormatId', {
        displayedFormatId: displayedFormatId.value,
    })
    const displayedFormat = allFormats.find((format) => format.id === displayedFormatId.value)
    if (displayedFormat) {
        mousePositionControl.setCoordinateFormat((coordinates) => {
            if (showCoordinateLabel(displayedFormat)) {
                return `${i18n.t('coordinates_label')} ${displayedFormat.format(
                    coordinates,
                    projection.value
                )}`
            }
            return displayedFormat.format(coordinates, projection.value, true)
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
