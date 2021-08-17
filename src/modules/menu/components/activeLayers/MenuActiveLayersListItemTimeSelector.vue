<template>
    <PopoverButton
        v-if="hasMultipleTimestamps"
        ref="popover"
        :button-title="renderHumanReadableTimestamp(timeConfig.currentTimestamp)"
        :button-bootstrap-class="'btn-danger'"
        :popover-title="$t('time_select_year')"
        with-close-button
        primary
    >
        <div class="timestamps-popover-content" data-cy="time-selection-popup">
            <button
                v-for="timestamp in allTimestampsIncludingAllIfNeeded"
                :key="timestamp"
                class="btn btn-timestamp"
                :class="{ 'btn-danger': timestamp === timeConfig.currentTimestamp }"
                :data-cy="`time-select-${timestamp}`"
                @click="handleClickOnTimestamp(timestamp)"
            >
                {{ renderHumanReadableTimestamp(timestamp) }}
            </button>
        </div>
    </PopoverButton>
</template>

<script>
import LayerTimeConfig from '@/api/layers/LayerTimeConfig.class'
import { isNumber } from '@/utils/numberUtils'
import PopoverButton from '@/utils/PopoverButton'

export default {
    components: { PopoverButton },
    props: {
        timeConfig: {
            type: LayerTimeConfig,
            required: true,
        },
    },
    computed: {
        hasMultipleTimestamps: function () {
            return this.timeConfig.series.length > 1
        },
        humanReadableCurrentTimestamp: function () {
            return this.renderHumanReadableTimestamp(this.timeConfig.currentTimestamp)
        },
        allTimestampsIncludingAllIfNeeded: function () {
            const timestamps = [...this.timeConfig.series]
            if (this.timeConfig.behaviour === 'all') {
                timestamps.splice(0, 0, 'all')
            }
            return timestamps
        },
    },
    methods: {
        renderHumanReadableTimestamp: function (timestamp) {
            if (!timestamp) {
                return ''
            }
            if (isNumber(timestamp)) {
                // if timestamp is already a 4 digit number (a year) we return it as is
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
        handleClickOnTimestamp: function (timestamp) {
            this.$emit('timestampChange', timestamp)
        },
    },
}
</script>

<style lang="scss">
.timestamps-popover-content {
    display: grid;
    max-height: 60vh;
    overflow-y: auto;
    background: white;
    grid-template-columns: 1fr 1fr 1fr;

    .btn-timestamp {
        white-space: nowrap;
    }
}
</style>
