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

const humanReadableCurrentTimestamp = computed(() =>
    renderHumanReadableTimestamp(timeConfig.value.currentTimeEntry)
)

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
        return ''
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
    // clearing preview year if one was selected, as a change on this time selector is incompatible with
    // the time slider being shown and active
    if (previewYear.value) {
        store.dispatch('clearPreviewYear', { ...dispatcher })
    }
    store.dispatch('setTimedLayerCurrentYear', { index: layerIndex.value, year, ...dispatcher })
}

function hidePopover() {
    popover?.hide()
}
</script>

<template>
    <button
        v-if="hasMultipleTimestamps"
        ref="timeSelectorButton"
        class="btn btn-secondary"
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
                    'btn-primary': timeEntry.timestamp === timeConfig.currentTimestamp,
                    'btn-light': timeEntry.timestamp !== timeConfig.currentTimestamp,
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
