<template>
    <span>
        <slot />
        <input
            ref="inputHidden"
            class="input-hidden"
            type="text"
            :value="value"
            tabindex="-1"
            aria-hidden="true"
        />
        <!-- eslint-disable vue/no-v-html-->
        <button
            ref="button"
            class="btn btn-light btn-sm"
            type="button"
            @click="copyValue"
            v-html="$t(buttonText)"
        />
        <!-- eslint-enable vue/no-v-html-->
    </span>
</template>

<script>
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
            buttonText: 'copy_cta',
        }
    },
    beforeUnmount() {
        clearTimeout(this.resetTimeout)
    },
    methods: {
        resetButton() {
            this.buttonText = 'copy_cta'
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
            this.buttonText = 'copy_done'
            this.resetTimeout = setTimeout(this.resetButton, this.resetDelay)
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/variables.scss';
.input-hidden {
    position: absolute;
    left: -999999999px;
}
.btn-sm {
    float: right;
    margin-top: -0.1rem;
    margin-left: 0.8rem;
    padding: 0 0.2rem;
    vertical-align: baseline;
    font-size: inherit;
    display: none;
    @media (min-width: $overlay-width) {
        display: block;
    }
}
</style>
