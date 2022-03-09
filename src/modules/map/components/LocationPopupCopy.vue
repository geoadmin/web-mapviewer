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
            {{ buttonText }}
        </button>
    </span>
</template>

<script>
import jQuery from 'jquery'

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
            buttonText: this.$t('copy_url'),
        }
    },
    beforeUnmount() {
        jQuery(this.$refs.inputVisible).tooltip('dispose')
        clearTimeout(this.resetTimeout)
    },
    mounted() {
        jQuery(this.$refs.inputVisible).tooltip({
            title: this.$t('share_link_tooltip'),
            trigger: 'focus', // focus only as hover doesn't make sense here.
            placement: 'bottom',
        })
    },
    methods: {
        resetButton() {
            this.buttonText = this.$t('copy_url')
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
            this.buttonText = this.$t('copy_success')
            this.resetTimeout = setTimeout(this.resetButton, this.resetDelay)
        },
    },
}
</script>

<style lang="scss" scoped>
.input-hidden {
    position: absolute;
    left: -999999999px;
}
</style>
