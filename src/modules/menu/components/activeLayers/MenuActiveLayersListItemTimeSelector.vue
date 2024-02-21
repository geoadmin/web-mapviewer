<template>
    <button
        v-if="hasMultipleTimestamps"
        ref="timeSelectorButton"
        class="btn btn-secondary"
        :class="{
            'btn-sm': compact,
        }"
        :data-cy="`time-selector-${layerId}`"
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

<script>
import tippy from 'tippy.js'
import { mapActions, mapState } from 'vuex'

import LayerTimeConfig from '@/api/layers/LayerTimeConfig.class'
import {
    CURRENT_YEAR_WMTS_TIMESTAMP,
    YEAR_TO_DESCRIBE_ALL_OR_CURRENT_DATA,
} from '@/api/layers/LayerTimeConfigEntry.class'

const STORE_DISPATCHER_MENU_ACTIVE_LAYERS_LIST_TIME = 'MenuActiveLayersListItemTimeSelector.vue'

export default {
    props: {
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
    },
    computed: {
        ...mapState({
            previewYear: (state) => state.layers.previewYear,
        }),
        hasMultipleTimestamps() {
            return this.timeConfig.timeEntries.length > 1
        },
        humanReadableCurrentTimestamp() {
            return this.renderHumanReadableTimestamp(this.timeConfig.currentTimeEntry)
        },
    },
    mounted() {
        if (this.hasMultipleTimestamps) {
            this.popover = tippy(this.$refs.timeSelectorButton, {
                theme: 'popover-button light-border',
                content: this.$refs.timeSelectorModal,
                allowHTML: true,
                placement: 'right',
                interactive: true,
                arrow: true,
                trigger: 'click',
            })
        }
    },
    beforeUnmount() {
        this.popover?.destroy()
    },
    methods: {
        ...mapActions(['setTimedLayerCurrentYear', 'clearPreviewYear']),
        /**
         * @param {LayerTimeConfigEntry} timeEntry
         * @returns {string}
         */
        renderHumanReadableTimestamp(timeEntry) {
            if (!timeEntry) {
                return ''
            }
            if (timeEntry.timestamp === CURRENT_YEAR_WMTS_TIMESTAMP) {
                return this.$t(`time_current`)
            }
            if (timeEntry.year === YEAR_TO_DESCRIBE_ALL_OR_CURRENT_DATA) {
                return this.$t('time_all')
            }
            return `${timeEntry.year}`
        },
        handleClickOnTimestamp(year) {
            // clearing preview year if one was selected, as a change on this time selector is incompatible with
            // the time slider being shown and active
            if (this.previewYear) {
                this.clearPreviewYear()
            }
            this.setTimedLayerCurrentYear({
                layerId: this.layerId,
                year,
                dispatcher: STORE_DISPATCHER_MENU_ACTIVE_LAYERS_LIST_TIME,
            })
        },
        hidePopover() {
            this.popover?.hide()
        },
    },
}
</script>

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
