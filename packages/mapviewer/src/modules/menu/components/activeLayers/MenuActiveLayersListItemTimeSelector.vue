<script setup>
import tippy from 'tippy.js'
import { computed, onBeforeUnmount, onMounted, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import LayerTimeConfig from '@/api/layers/LayerTimeConfig.class'
import {
    ALL_YEARS_TIMESTAMP,
    CURRENT_YEAR_TIMESTAMP,
} from '@/api/layers/LayerTimeConfigEntry.class'
import TextTruncate from '@/utils/components/TextTruncate.vue'

const dispatcher = { dispatcher: 'MenuActiveLayersListItemTimeSelector.vue' }

const { layerIndex, layerId, timeConfig, compact } = defineProps({
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

const store = useStore()
const { t } = useI18n()

const timeSelectorButton = useTemplateRef('timeSelectorButton')
const timeSelectorModal = useTemplateRef('timeSelectorModal')

const hasMultipleTimestamps = computed(() => timeConfig.timeEntries.length > 1)
const hasValidTimestamps = computed(() =>
    // External layers may have timestamp that we don't support (not "all", "current" or ISO timestamp)
    timeConfig.timeEntries.every((entry) => entry.year !== null)
)
const hasTimeSelector = computed(() => hasMultipleTimestamps.value && hasValidTimestamps.value)
const isTimeSliderActive = computed(() => store.state.ui.isTimeSliderActive)

const humanReadableCurrentTimestamp = computed(() => {
    return renderHumanReadableTimestamp(timeConfig.currentTimeEntry)
})

let popover = null

onMounted(() => {
    if (hasTimeSelector.value) {
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
    if (timeEntry.year === CURRENT_YEAR_TIMESTAMP) {
        return t(`time_current`)
    }
    if (timeEntry.year === ALL_YEARS_TIMESTAMP) {
        return t('time_all')
    }
    return `${timeEntry.year}`
}

function handleClickOnTimestamp(year) {
    // deactivating the time slider, as a change on this time selector is incompatible with
    // the time slider being shown and active
    if (isTimeSliderActive.value) {
        store.dispatch('setTimeSliderActive', { timeSliderActive: false, ...dispatcher })
    }
    store.dispatch('setTimedLayerCurrentYear', { index: layerIndex, year, ...dispatcher })
}

function hidePopover() {
    popover?.hide()
}

function isSelected(timeEntry) {
    return timeConfig.currentTimestamp === timeEntry?.timestamp
}
</script>

<template>
    <div v-if="hasTimeSelector">
        <button
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
            ref="timeSelectorModal"
            class="card border-0"
            @click="hidePopover"
        >
            <div class="card-header d-flex align-items-center justify-content-between">
                {{ t('time_select_year') }}
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
