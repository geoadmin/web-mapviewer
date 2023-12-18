<template>
    <div class="input-group input-group-sm">
        <input
            ref="input"
            v-bind="$attrs"
            class="form-control form-control-sm"
            type="text"
            :value="value"
            readonly
            data-cy="location-popup-link-input"
            @focus="focusSelect"
        />
        <button ref="button" class="btn btn-secondary" type="button" @click="copyValue">
            {{ $t(buttonText) }}
        </button>
    </div>
</template>

<script>
import { Tooltip } from 'bootstrap'
import { mapGetters } from 'vuex'

import log from '@/utils/logging'

export default {
    inheritAttrs: false,
    props: {
        value: {
            type: String,
            required: true,
        },
        resetDelay: {
            type: Number,
            default: 1000,
        },
    },
    data() {
        return {
            resetTimeout: null,
            buttonText: 'copy_url',
        }
    },
    computed: {
        ...mapGetters({ showTooltip: 'isDesktopMode' }),
    },
    mounted() {
        this.tooltip = new Tooltip(this.$refs.input, {
            trigger: 'focus',
            placement: 'bottom',
            title: () => (this.showTooltip ? this.$t('share_link_tooltip') : null),
        })
    },
    beforeUnmount() {
        this.tooltip.dispose()
        delete this.tooltip
    },
    unmounted() {
        clearTimeout(this.resetTimeout)
    },
    methods: {
        resetButton() {
            this.buttonText = 'copy_url'
        },
        focusSelect(event) {
            event.target.select()
        },
        async copyValue() {
            try {
                await navigator.clipboard.writeText(this.value)
                // Change button text and start the reset timer.
                this.buttonText = 'copy_success'
                this.resetTimeout = setTimeout(this.resetButton, this.resetDelay)
            } catch (error) {
                log.error(`Failed to copy to clipboard:`, error)
            }
        },
    },
}
</script>

<style lang="scss" scoped>
.btn,
.form-control {
    font-size: inherit;
}
</style>
