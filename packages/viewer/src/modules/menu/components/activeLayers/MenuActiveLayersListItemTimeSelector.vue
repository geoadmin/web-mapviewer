<script setup lang="ts">
import GeoadminTooltip from '@swissgeo/tooltip'
import { computed, type ComputedRef } from 'vue'
import { useI18n } from 'vue-i18n'

import TextTruncate from '@/utils/components/TextTruncate.vue'
import {
    ALL_YEARS_TIMESTAMP,
    CURRENT_YEAR_TIMESTAMP,
    type LayerTimeConfig,
    type LayerTimeConfigEntry,
} from '@swissgeo/layers'
import useUIStore from '@/store/modules/ui.store'
import useLayersStore from '@/store/modules/layers.store'

const dispatcher = { name: 'MenuActiveLayersListItemTimeSelector.vue' }

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

const hasMultipleTimestamps = computed(() => timeConfig.timeEntries.length > 1)
const hasValidTimestamps = computed(() =>
    // External layers may have timestamp that we don't support (not "all", "current" or ISO timestamp)
    timeConfig.timeEntries.every((entry) => entry.year !== null)
)
const hasTimeSelector = computed(() => hasMultipleTimestamps.value && hasValidTimestamps.value)
const isTimeSliderActive = computed(() => uiStore.isTimeSliderActive)

const timeConfigEntriesWithYear: ComputedRef<(LayerTimeConfigEntry & { year: string })[]> =
    computed(() =>
        timeConfig.timeEntries.filter(
            (entry): entry is LayerTimeConfigEntry & { year: string } => entry.year !== undefined
        )
    )

const humanReadableCurrentTimestamp = computed(() => {
    if (timeConfig.currentTimeEntry) {
        return renderHumanReadableTimestamp(timeConfig.currentTimeEntry)
    }
    return ''
})

/**
 * @param {LayerTimeConfigEntry} timeEntry
 * @returns {string}
 */
function renderHumanReadableTimestamp(timeEntry: LayerTimeConfigEntry) {
    if (!timeEntry || !timeEntry.year) {
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

function handleClickOnTimestamp(entry: LayerTimeConfigEntry) {
    // deactivating the time slider, as a change on this time selector is incompatible with
    // the time slider being shown and active
    if (isTimeSliderActive.value) {
        uiStore.setTimeSliderActive(false, dispatcher)
    }
    layersStore.setTimedLayerCurrentTimeEntry(layerIndex, entry, dispatcher)
}

function isSelected(timeEntry: LayerTimeConfigEntry) {
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
}
</style>
