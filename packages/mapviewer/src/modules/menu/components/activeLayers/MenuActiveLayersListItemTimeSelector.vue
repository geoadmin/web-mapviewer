<script setup lang="ts">
import type { LayerTimeConfig, LayerTimeConfigEntry } from '@geoadmin/layers'

import { ALL_YEARS_TIMESTAMP, CURRENT_YEAR_TIMESTAMP } from '@geoadmin/layers'
import GeoadminTooltip from '@geoadmin/tooltip'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import TextTruncate from '@/utils/components/TextTruncate.vue'

const dispatcher = { dispatcher: 'MenuActiveLayersListItemTimeSelector.vue' }

const {
    layerIndex,
    layerId,
    timeConfig,
    compact = false,
} = defineProps<{
    layerIndex: number
    layerId: string
    timeConfig: LayerTimeConfig
    compact?: boolean
}>()

const store = useStore()
const { t } = useI18n()

const hasMultipleTimestamps = computed<boolean>(() => timeConfig.timeEntries.length > 1)
const hasTimeSelector = computed<boolean>(() => hasMultipleTimestamps.value)
const isTimeSliderActive = computed<boolean>(() => store.state.ui.isTimeSliderActive)

const humanReadableCurrentTimestamp = computed<string>(() => {
    return renderHumanReadableTimestamp(timeConfig.currentTimeEntry)
})

function renderHumanReadableTimestamp(timeEntry: LayerTimeConfigEntry): string {
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

function handleClickOnTimestamp(year: number): void {
    // deactivating the time slider, as a change on this time selector is incompatible with
    // the time slider being shown and active
    if (isTimeSliderActive.value) {
        store.dispatch('setTimeSliderActive', { timeSliderActive: false, ...dispatcher })
    }
    store.dispatch('setTimedLayerCurrentYear', { index: layerIndex, year, ...dispatcher })
}

function isSelected(timeEntry: LayerTimeConfigEntry): boolean {
    return timeConfig.currentTimeEntry?.timestamp === timeEntry?.timestamp
}
</script>

<template>
    <div v-if="hasTimeSelector">
        <GeoadminTooltip
            placement="right"
            open-trigger="click"
        >
            <button
                ref="timeSelectorButton"
                class="btn btn-secondary btn-timestamp btn-timestamp-selector me-1"
                :class="{
                    'btn-sm': compact,
                    'btn-timestamp-selector-compact': compact,
                }"
                :data-cy="`time-selector-${layerId}-${layerIndex}`"
            >
                <TextTruncate>
                    {{ humanReadableCurrentTimestamp }}
                </TextTruncate>
            </button>

            <template #content="{ close }">
                <div
                    ref="timeSelectorModal"
                    class="card border-0"
                >
                    <div class="card-header d-flex align-items-center justify-content-between">
                        {{ t('time_select_year') }}
                    </div>
                    <div
                        class="card-body rounded-bottom d-grid timestamps-popover-content gap-1 p-2"
                        data-cy="time-selection-popup"
                        @click="close"
                    >
                        <button
                            v-for="timeEntry in timeConfig.timeEntries"
                            :key="timeEntry.timestamp"
                            class="btn d-flex justify-content-center"
                            :class="{
                                'btn-primary': isSelected(timeEntry),
                                'btn-light': !isSelected(timeEntry),
                            }"
                            :data-cy="`time-select-${timeEntry.timestamp}`"
                            @click="handleClickOnTimestamp(timeEntry.year)"
                        >
                            <TextTruncate>
                                {{ renderHumanReadableTimestamp(timeEntry) }}
                            </TextTruncate>
                        </button>
                    </div>
                </div>
            </template>
        </GeoadminTooltip>
    </div>
</template>

<style lang="scss" scoped>
.timestamps-popover-content {
    max-height: 33vh;
    overflow-y: auto;
    background: white;
    grid-template-columns: 1fr 1fr 1fr;
}
.btn-timestamp-selector {
    font-size: small;
}
</style>
