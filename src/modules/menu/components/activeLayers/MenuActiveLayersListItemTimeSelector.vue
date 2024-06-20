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
import TextTruncate from '@/utils/components/TextTruncate.vue'

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
const hasMultipleTimestamps = computed(
    () => timeConfig.value.timeEntries.length > 1 && hasValidTimestamp.value
)
const isTimeSliderActive = computed(() => store.state.ui.isTimeSliderActive)

const isLayerVisible = computed(() => store.state.layers.activeLayers[layerIndex.value].visible)
const humanReadableCurrentTimestamp = computed(() => {
    if (isLayerVisible.value && isTimeSliderActive.value) {
        return timeConfig.value.years.includes(previewYear.value) ? previewYear.value : '-'
    }
    return renderHumanReadableTimestamp(timeConfig.value.currentTimeEntry)
})
// Some external layers might have a time dimension with invalid timestamps, in this case we
// use the default timestamp as dimension and don't display the time selector.
const hasValidTimestamp = computed(() => !!timeConfig.value?.currentTimeEntry?.year)

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
            // Required by the cypres test to avoid CSS issues on cypress when testing the tippy content
            appendTo: document.body,
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
    if (timeEntry.year === null) {
        return timeEntry.timestamp
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

function isSelected(timeEntry) {
    return timeConfig.value.currentTimestamp === timeEntry?.timestamp
}
</script>

<template>
    <button
        v-if="hasMultipleTimestamps"
        ref="timeSelectorButton"
        class="btn btn-secondary me-1 btn-timestamp btn-timestamp-selector"
        :class="{
            'btn-sm': compact,
            'btn-timestamp-selector-compact': compact,
        }"
        :data-cy="`time-selector-${layerId}-${layerIndex}`"
    >
        <TextTruncate>{{ humanReadableCurrentTimestamp }}</TextTruncate>
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
                class="btn mb-1 me-1 btn-timestamp-selection-popup"
                :class="{
                    'btn-primary': isSelected(timeEntry),
                    'btn-light': !isSelected(timeEntry),
                }"
                :data-cy="`time-select-${timeEntry.timestamp}`"
                @click="handleClickOnTimestamp(timeEntry.year)"
            >
                <TextTruncate>{{ renderHumanReadableTimestamp(timeEntry) }}</TextTruncate>
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
}
.btn-timestamp-selection-popup {
    max-width: 100px;
}
.btn-timestamp-selector {
    font-size: small;
    $btn-width: 68px; // 68px allow the word "Actual" in all languages without being truncated
    // Here we need to use min/max-width otherwise the size is not always identical over all layers
    min-width: $btn-width;
    max-width: $btn-width;

    &-compact {
        $btn-width: 60px; // 60px allow the word "Actual" in all languages without being truncated
        min-width: $btn-width;
        max-width: $btn-width;
        padding-top: 2px;
        padding-bottom: 2px;
    }
}
</style>
