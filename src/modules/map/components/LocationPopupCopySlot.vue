<template>
    <!-- eslint-disable vue/no-v-html-->
    <button
        ref="button"
        class="btn btn-light btn-sm"
        type="button"
        @click="copyValue"
        v-html="$t(buttonText)"
    />
    <!-- eslint-enable vue/no-v-html-->
</template>

<script>
import log from '@/utils/logging'

export default {
    props: {
        value: {
            type: String,
            default: '',
        },
        resetDelay: {
            type: Number,
            default: 1000,
        },
    },
    data() {
        return {
            buttonText: 'copy_cta',
        }
    },
    unmounted() {
        clearTimeout(this.resetTimeout)
    },
    methods: {
        resetButton() {
            this.buttonText = 'copy_cta'
        },
        async copyValue() {
            try {
                await navigator.clipboard.writeText(this.value)

                // Change button text and start the reset timer.
                this.buttonText = 'copy_done'
                this.resetTimeout = setTimeout(this.resetButton, this.resetDelay)
            } catch (error) {
                log.error(`Failed to copy to clipboard: ${error}`)
            }
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/variables.scss';
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
