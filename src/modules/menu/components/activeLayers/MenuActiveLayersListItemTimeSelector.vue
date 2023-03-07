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
                v-for="timestamp in allTimestampsIncludingAllIfNeeded"
                :key="timestamp"
                class="btn mb-1 me-1"
                :class="{
                    'btn-primary': timestamp === timeConfig.currentTimestamp,
                    'btn-light': timestamp !== timeConfig.currentTimestamp,
                }"
                :data-cy="`time-select-${timestamp}`"
                @click="handleClickOnTimestamp(timestamp)"
            >
                {{ renderHumanReadableTimestamp(timestamp) }}
            </button>
        </div>
    </div>
</template>

<script>
import LayerTimeConfig from '@/api/layers/LayerTimeConfig.class'
import { isNumber } from '@/utils/numberUtils'
import tippy from 'tippy.js'

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
    emits: ['timestampChange'],
    computed: {
        hasMultipleTimestamps() {
            return this.timeConfig.series.length > 1
        },
        humanReadableCurrentTimestamp() {
            return this.renderHumanReadableTimestamp(this.timeConfig.currentTimestamp)
        },
        allTimestampsIncludingAllIfNeeded() {
            const timestamps = [...this.timeConfig.series]
            if (this.timeConfig.behaviour === 'all') {
                timestamps.splice(0, 0, 'all')
            }
            return timestamps
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
        renderHumanReadableTimestamp(timestamp) {
            if (!timestamp) {
                return ''
            }
            if (isNumber(timestamp)) {
                // if timestamp is already a 4-digit number (a year) we return it as is
                if (timestamp.length === 4) {
                    return timestamp
                } else {
                    const yearOfTimestamp = timestamp.substr(0, 4)
                    if (yearOfTimestamp === '9999') {
                        return this.$t('time_all')
                    } else {
                        return yearOfTimestamp
                    }
                }
            } else {
                return this.$t(`time_${timestamp}`)
            }
        },
        handleClickOnTimestamp(timestamp) {
            this.$emit('timestampChange', timestamp)
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
