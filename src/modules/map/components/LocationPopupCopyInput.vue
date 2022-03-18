<template>
    <span class="input-group input-group-sm">
        <input
            ref="inputVisible"
            v-bind="$attrs"
            class="form-control form-control-sm"
            type="text"
            :value="value"
            readonly
            @focus="focusSelect"
        />
        <input
            ref="inputHidden"
            class="input-hidden"
            type="text"
            :value="value"
            tabindex="-1"
            aria-hidden="true"
        />
        <button ref="button" class="btn btn-secondary" type="button" @click="copyValue">
            {{ $t(buttonText) }}
        </button>
    </span>
</template>

<script>
import jQuery from 'jquery'
import { mapState } from 'vuex'
import { UIModes } from '@/modules/store/modules/ui.store'

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
        jQuery(this.$refs.inputVisible).tooltip({
            trigger: 'focus',
            placement: 'bottom',
            title: () => (this.showTooltip ? this.$t('share_link_tooltip') : null),
        })
    },
    beforeUnmount() {
        jQuery(this.$refs.inputVisible).tooltip('dispose')
        clearTimeout(this.resetTimeout)
    },
    methods: {
        resetButton() {
            this.buttonText = 'copy_url'
        },
        focusSelect(event) {
            event.target.select()
        },
        copyValue() {
            // Don't use the Clipboard API just yet. While execCommand might be
            // deprecated, browser support for the new API is not sufficient and
            // would require to keep execCommand anyway as a fallback.
            this.$refs.inputHidden.focus()
            this.$refs.inputHidden.select()
            document.execCommand('copy')

            // Set focus back to where the user clicked.
            this.$refs.button.focus()

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
.input-hidden {
    position: absolute;
    left: -999999999px;
}
</style>
