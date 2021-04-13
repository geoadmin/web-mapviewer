<template>
    <button
        v-if="hasMultipleTimestamps"
        ref="popoverButton"
        class="btn btn-sm btn-danger px-2"
        data-html="true"
        :title="$t('time_select_year')"
        data-custom-class="timestamps-popover"
        data-content="<div class='timestamps-popover-container'></div>"
    >
        {{ humanReadableCurrentTimestamp }}
    </button>
</template>

<script>
import jquery from 'jquery'
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
        timestampSelectionList: function () {
            const timestampButtons = []
            this.allTimestampsIncludingAllIfNeeded.forEach((timestamp) => {
                const buttonClasses = ['btn', 'btn-timestamp']
                if (timestamp === this.timeConfig.currentTimestamp) {
                    buttonClasses.push('btn-danger')
                }
                timestampButtons.push(
                    `<button class="${buttonClasses.join(' ')}" 
                             data-timestamp="${timestamp}"
                             data-cy="time-select-${timestamp}">
                        ${this.renderHumanReadableTimestamp(timestamp)}
                    </button>`
                )
            })
            return `<div class="popover-timestamps" data-cy="time-selection-popup">
                        ${timestampButtons.join('')}
                    </div>`
        },
    },
    mounted() {
        this.popover = jquery(this.$refs.popoverButton).popover({
            trigger: 'focus',
            html: true,
        })
        this.popover.on('inserted.bs.popover', () => {
            jquery('.timestamps-popover-container').append(jquery(this.timestampSelectionList))
            jquery('.btn-timestamp').on('click', (event) => {
                this.$emit('timestampChange', jquery(event.target).attr('data-timestamp'))
            })
        })
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
    },
}
</script>

<style lang="scss">
.timestamps-popover {
    .popover-body {
        max-height: 60vh;
        overflow-y: auto;
    }
    .popover-timestamps {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;

        .btn-timestamp {
            white-space: nowrap;
        }
    }
}
</style>
