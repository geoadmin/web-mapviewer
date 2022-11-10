<template>
    <PopoverButton
        v-if="hasMultipleTimestamps"
        ref="popover"
        :button-title="renderHumanReadableTimestamp(timeConfig.currentTimestamp)"
        :popover-title="$t('time_select_year')"
        :small="compact"
        secondary
    >
        <div class="timestamps-popover-content p-2" data-cy="time-selection-popup">
            <button
                v-for="timestamp in allTimestampsIncludingAllIfNeeded"
                :key="timestamp"
                class="btn"
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
    </PopoverButton>
</template>

<script>
import LayerTimeConfig from '@/api/layers/LayerTimeConfig.class'
import { isNumber } from '@/utils/numberUtils'
import PopoverButton from '@/utils/PopoverButton.vue'

export default {
    components: { PopoverButton },
    props: {
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
    methods: {
        renderHumanReadableTimestamp(timestamp) {
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
        handleClickOnTimestamp(timestamp) {
            this.$emit('timestampChange', timestamp)
        },
    },
}
</script>

<style lang="scss" scoped>
.timestamps-popover-content {
    display: grid;
    height: 20rem;
    max-height: 33vh;
    overflow-y: auto;
    background: white;
    grid-template-columns: 1fr 1fr 1fr;

    .btn-timestamp {
        white-space: nowrap;
    }
}
</style>
