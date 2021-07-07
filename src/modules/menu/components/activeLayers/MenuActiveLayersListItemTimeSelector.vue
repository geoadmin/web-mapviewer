<template>
    <div>
        <button
            v-if="hasMultipleTimestamps"
            ref="popoverButton"
            class="btn btn-sm btn-danger px-2"
            data-html="true"
            :title="$t('time_select_year')"
            data-custom-class="timestamps-popover"
            data-content="<div class='timestamps-popover-container'></div>"
            data-bs-toggle="popover"
            @click="togglePopover"
        >
            {{ humanReadableCurrentTimestamp }}
        </button>
        <div
            ref="popoverContent"
            :class="{ 'd-none': !showPopoverContent }"
            class="timestamps-popover-content"
            data-cy="time-selection-popup"
        >
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
    </div>
</template>

<script>
import { Popover } from 'bootstrap'
import LayerTimeConfig from '@/api/layers/LayerTimeConfig.class'
import { isNumber } from '@/utils/numberUtils'

export default {
    props: {
        timeConfig: {
            type: LayerTimeConfig,
            required: true,
        },
    },
    data() {
        return {
            popover: null,
            showPopoverContent: false,
        }
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
    mounted() {
        if (this.hasMultipleTimestamps) {
            this.popover = Popover.getOrCreateInstance(this.$refs.popoverButton, {
                content: this.$refs.popoverContent,
                html: true,
            })
        }
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
            this.showPopoverContent = false
            this.popover.hide()
        },
        togglePopover: function () {
            this.showPopoverContent = !this.showPopoverContent
            if (this.showPopoverContent) {
                this.popover.update()
            }
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
