<script setup>
import tippy from 'tippy.js'
import { computed, onBeforeUnmount, onMounted, ref, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import LayerTimeConfig from '@/api/layers/LayerTimeConfig.class'
import {
    CURRENT_YEAR_WMTS_TIMESTAMP,
    YEAR_TO_DESCRIBE_ALL_OR_CURRENT_DATA,
} from '@/api/layers/LayerTimeConfigEntry.class'

const dispatcher = { dispatcher: 'MenuActiveLayersListItemTimeSelector.vue' }

const props = defineProps({
    layerIndex: {
        type: Number,
        required: true,
    },
    layerId: {
        type: String,
        required: true,
    },
    timeConfig: {
        type: LayerTimeConfig,
        required: true,
    },
    compact: {
        type: Boolean,
        default: false,
    },
})
const { layerIndex, layerId, timeConfig, compact } = toRefs(props)

const store = useStore()
const i18n = useI18n()

const timeSelectorButton = ref(null)
const timeSelectorModal = ref(null)

const previewYear = computed(() => store.state.layers.previewYear)
const hasMultipleTimestamps = computed(() => timeConfig.value.timeEntries.length > 1)
const isTimeSliderActive = computed(() => store.state.ui.isTimeSliderActive)

const isLayerVisible = computed(() => store.state.layers.activeLayers[layerIndex.value].visible)
const humanReadableCurrentTimestamp = computed(() => {
    if (isLayerVisible.value && isTimeSliderActive.value) {
        return timeConfig.value.years.includes(previewYear.value) ? previewYear.value : '-'
    }
    return renderHumanReadableTimestamp(timeConfig.value.currentTimeEntry)
})

let popover = null

onMounted(() => {
    if (hasMultipleTimestamps.value) {
        popover = tippy(timeSelectorButton.value, {
            theme: 'popover-button light-border',
            content: timeSelectorModal.value,
            allowHTML: true,
            placement: 'right',
            interactive: true,
            arrow: true,
            trigger: 'click',
        })
    }
})

onBeforeUnmount(() => {
    popover?.destroy()
})

/**
 * @param {LayerTimeConfigEntry} timeEntry
 * @returns {string}
 */
function renderHumanReadableTimestamp(timeEntry) {
    if (!timeEntry) {
        return '-'
    }
    if (timeEntry.timestamp === CURRENT_YEAR_WMTS_TIMESTAMP) {
        return i18n.t(`time_current`)
    }
    if (timeEntry.year === YEAR_TO_DESCRIBE_ALL_OR_CURRENT_DATA) {
        return i18n.t('time_all')
    }
    return `${timeEntry.year}`
}

function handleClickOnTimestamp(year) {
    // deactivating the time slider, as a change on this time selector is incompatible with
    // the time slider being shown and active
    if (isTimeSliderActive.value) {
        store.dispatch('setTimeSliderActive', { timeSliderActive: false, ...dispatcher })
    }
    store.dispatch('setTimedLayerCurrentYear', { index: layerIndex.value, year, ...dispatcher })
}

function hidePopover() {
    popover?.hide()
}

// for CSS : isSelected refers to either the current year, or the preview year if the time slider is active and the layer is visible
function isSelected(timeEntry) {
    return isTimeSliderActive.value && isLayerVisible.value
        ? previewYear.value === timeEntry?.year
        : timeConfig.value.currentTimestamp === timeEntry?.timestamp
}
// for CSS : baseYear refer to the year to which the timestamp will return to when the time slider is unmounted.
function baseYear(timeEntry) {
    return (
        isTimeSliderActive.value &&
        isLayerVisible.value &&
        timeConfig.value.currentTimestamp === timeEntry?.timestamp &&
        timeEntry?.year !== previewYear.value
    )
}
</script>

<template>
    <button
        v-if="hasMultipleTimestamps"
        ref="timeSelectorButton"
        class="btn btn-secondary me-2 w-13"
        :class="{
            'btn-sm': compact,
        }"
        :data-cy="`time-selector-${layerId}-${layerIndex}`"
    >
        {{ humanReadableCurrentTimestamp }}
    </button>
    <div
        v-if="hasMultipleTimestamps"
        ref="timeSelectorModal"
        class="card border-0"
        @click="hidePopover"
    >
        <div class="card-header d-flex align-items-center justify-content-between">
            {{ $t('time_select_year') }}
        </div>
        <div
            class="card-body rounded-bottom p-2 timestamps-popover-content"
            data-cy="time-selection-popup"
        >
            <button
                v-for="timeEntry in timeConfig.timeEntries"
                :key="timeEntry.timestamp"
                class="btn mb-1 me-1"
                :class="{
                    'btn-primary': isTimeSliderActive
                        ? previewYear === timeEntry.year
                        : timeConfig.currentTimestamp === timeEntry.timestamp,
                    'btn-outline-primary':
                        isTimeSliderActive &&
                        timeConfig.currentTimestamp === timeEntry.timestamp &&
                        timeEntry.year !== previewYear,
                    'btn-light':
                        timeEntry.timestamp !== timeConfig.currentTimestamp &&
                        (!isTimeSliderActive || previewYear !== timeEntry.year),
                }"
                :data-cy="`time-select-${timeEntry.timestamp}`"
                @click="handleClickOnTimestamp(timeEntry.year)"
            >
                {{ renderHumanReadableTimestamp(timeEntry) }}
            </button>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.timestamps-popover-content {
    display: grid;
    max-height: 33vh;
    overflow-y: auto;
    background: white;
    grid-template-columns: 1fr 1fr 1fr;

    .btn-timestamp {
        white-space: nowrap;
    }
}
</style>
