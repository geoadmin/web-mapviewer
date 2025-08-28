<script setup>
import GeoadminTooltip from "@swissgeo/tooltip";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useStore } from "vuex";

import LayerTimeConfig from "@/api/layers/LayerTimeConfig.class";
import {
  ALL_YEARS_TIMESTAMP,
  CURRENT_YEAR_TIMESTAMP,
} from "@/api/layers/LayerTimeConfigEntry.class";
import TextTruncate from "@/utils/components/TextTruncate.vue";

const dispatcher = { dispatcher: "MenuActiveLayersListItemTimeSelector.vue" };

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
});

const store = useStore();
const { t } = useI18n();

const hasMultipleTimestamps = computed(() => timeConfig.timeEntries.length > 1);
const hasValidTimestamps = computed(() =>
  // External layers may have timestamp that we don't support (not "all", "current" or ISO timestamp)
  timeConfig.timeEntries.every((entry) => entry.year !== null)
);
const hasTimeSelector = computed(
  () => hasMultipleTimestamps.value && hasValidTimestamps.value
);
const isTimeSliderActive = computed(() => store.state.ui.isTimeSliderActive);

const humanReadableCurrentTimestamp = computed(() => {
  return renderHumanReadableTimestamp(timeConfig.currentTimeEntry);
});

/**
 * @param {LayerTimeConfigEntry} timeEntry
 * @returns {string}
 */
function renderHumanReadableTimestamp(timeEntry) {
  if (!timeEntry) {
    return "-";
  }
  if (timeEntry.year === CURRENT_YEAR_TIMESTAMP) {
    return t(`time_current`);
  }
  if (timeEntry.year === ALL_YEARS_TIMESTAMP) {
    return t("time_all");
  }
  return `${timeEntry.year}`;
}

function handleClickOnTimestamp(year) {
  // deactivating the time slider, as a change on this time selector is incompatible with
  // the time slider being shown and active
  if (isTimeSliderActive.value) {
    store.dispatch("setTimeSliderActive", { timeSliderActive: false, ...dispatcher });
  }
  store.dispatch("setTimedLayerCurrentYear", { index: layerIndex, year, ...dispatcher });
}

function isSelected(timeEntry) {
  return timeConfig.currentTimestamp === timeEntry?.timestamp;
}
</script>

<template>
    <div v-if="hasTimeSelector">
        <GeoadminTooltip placement="right" open-trigger="click">
            <button
                ref="timeSelectorButton"
                class="btn btn-secondary me-1 btn-timestamp btn-timestamp-selector"
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
                <div ref="timeSelectorModal" class="card border-0">
                    <div class="card-header d-flex align-items-center justify-content-between">
                        {{ t("time_select_year") }}
                    </div>
                    <div
                        class="card-body rounded-bottom p-2 d-grid timestamps-popover-content gap-1"
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
