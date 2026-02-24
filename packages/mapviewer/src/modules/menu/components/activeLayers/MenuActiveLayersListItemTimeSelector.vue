<script setup lang="ts">
import type { LayerTimeConfig, LayerTimeConfigEntry } from '@swissgeo/layers'

import { ALL_YEARS_TIMESTAMP, CURRENT_YEAR_TIMESTAMP } from '@swissgeo/layers'
import GeoadminTooltip from '@swissgeo/tooltip'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type { ActionDispatcher } from '@/store/types'

import useLayersStore from '@/store/modules/layers'
import useUIStore from '@/store/modules/ui'
import TextTruncate from '@/utils/components/TextTruncate.vue'

const dispatcher: ActionDispatcher = { name: 'MenuActiveLayersListItemTimeSelector.vue' }

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

const { t } = useI18n()
const uiStore = useUIStore()
const layersStore = useLayersStore()

const hasMultipleTimestamps = computed<boolean>(() => timeConfig.timeEntries.length > 1)
const hasValidTimestamps = computed<boolean>(() =>
    // External layers may have timestamp that we don't support (not "all", "current" or ISO timestamp)
    timeConfig.timeEntries.every(
        (entry) => ('year' in entry && !!entry.year) || !!entry.nonTimeBasedValue
    )
)
const hasTimeSelector = computed<boolean>(
    () => hasMultipleTimestamps.value && hasValidTimestamps.value
)
const isTimeSliderActive = computed<boolean>(() => uiStore.isTimeSliderActive)

const timeConfigEntriesWithYear = computed<LayerTimeConfigEntry[]>(() =>
    timeConfig.timeEntries.filter(
        (entry): entry is LayerTimeConfigEntry =>
            ('year' in entry && !!entry.year) || !!entry.nonTimeBasedValue
    )
)

const humanReadableCurrentTimestamp = computed<string>(() =>
    renderHumanReadableTimestamp(timeConfig.currentTimeEntry)
)

function renderHumanReadableTimestamp(timeEntry?: LayerTimeConfigEntry): string {
    if (!timeEntry) {
        return '-'
    }
    if (timeEntry.nonTimeBasedValue === CURRENT_YEAR_TIMESTAMP) {
        return t(`time_current`)
    }
    if (timeEntry.nonTimeBasedValue === ALL_YEARS_TIMESTAMP) {
        return t('time_all')
    }
    if (timeEntry.year) {
        return `${timeEntry.year}`
    }
    if (timeEntry.nonTimeBasedValue) {
        return t(timeEntry.nonTimeBasedValue)
    }
    return '-'
}

function handleClickOnTimestamp(entry: LayerTimeConfigEntry): void {
    // deactivating the time slider, as a change on this time selector is incompatible with
    // the time slider being shown and active
    if (isTimeSliderActive.value) {
        uiStore.setTimeSliderActive(false, dispatcher)
    }
    layersStore.setTimedLayerCurrentTimeEntry(layerIndex, entry, dispatcher)
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
                            v-for="timeEntry in timeConfigEntriesWithYear"
                            :key="timeEntry.timestamp"
                            class="btn d-flex justify-content-center"
                            :class="{
                                'btn-primary': isSelected(timeEntry),
                                'btn-light': !isSelected(timeEntry),
                            }"
                            :data-cy="`time-select-${timeEntry.timestamp}`"
                            @click="handleClickOnTimestamp(timeEntry)"
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
    max-width: 100px;
}
</style>
