<template>
    <span class="input-group input-group-sm">
        <input
            ref="input"
            v-bind="$attrs"
            class="form-control form-control-sm"
            type="text"
            :value="value"
            readonly
            @focus="focusSelect"
        />
        <button ref="button" class="btn btn-secondary" type="button" @click="copyValue">
            {{ $t(buttonText) }}
        </button>
    </span>
</template>

<script>
import jQuery from 'jquery'
import { mapState } from 'vuex'
import { UIModes } from '@/store/modules/ui.store'

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
        ...mapState({
            showTooltip: (state) => state.ui.mode === UIModes.MENU_ALWAYS_OPEN,
        }),
    },
    mounted() {
        jQuery(this.$refs.input).tooltip({
            trigger: 'focus',
            placement: 'bottom',
            title: () => (this.showTooltip ? this.$t('share_link_tooltip') : null),
        })
    },
    beforeUnmount() {
        jQuery(this.$refs.input).tooltip('dispose')
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
            await navigator.clipboard.writeText(this.value)

            // Change button text and start the reset timer.
            this.buttonText = 'copy_success'
            this.resetTimeout = setTimeout(this.resetButton, this.resetDelay)
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
