<template>
    <div v-if="inputText">
        <label v-if="labelText">{{ $t(labelText) }}: </label>
        <div class="input-group" :class="{ 'input-group-sm': small }">
            <input
                type="text"
                class="form-control input-text-to-copy"
                readonly="readonly"
                :value="inputText"
                data-cy="menu-share-input-copy-button"
                @focus="$event.target.select()"
            />
            <button
                class="btn btn-outline-group"
                data-cy="menu-share-input-copy-button"
                @click="copyInputToClipboard"
            >
                {{ buttonText }}
            </button>
        </div>
    </div>
</template>

<script>
import { useI18n } from 'vue-i18n'

/** Simple input with a helper button to copy the input value to the clipboard */
export default {
    props: {
        inputText: {
            type: String,
            default: null,
        },
        small: {
            type: Boolean,
            default: true,
        },
        copyText: {
            type: String,
            default: 'copy_cta', // 'copy_url',
        },
        copiedText: {
            type: String,
            default: 'copy_done', // 'copy_success',
        },
        labelText: {
            type: String,
            default: null,
        },
    },
    setup() {
        const i18n = useI18n()
        return {
            i18n,
        }
    },
    data() {
        return {
            copiedInClipboard: false,
            timeoutCopied: null,
        }
    },
    computed: {
        buttonText() {
            return this.i18n
                .t(this.copiedInClipboard ? this.copiedText : this.copyText)
                .replace('&nbsp;', '\xa0')
        },
    },
    watch: {
        inputText() {
            this.clearIsCopiedInClipboard()
        },
    },
    beforeUnmount() {
        clearTimeout(this.timeoutCopied)
    },
    methods: {
        clearIsCopiedInClipboard() {
            this.copiedInClipboard = false
            clearTimeout(this.timeoutCopied)
        },
        copyInputToClipboard() {
            navigator.clipboard.writeText(this.inputText)
            this.copiedInClipboard = true
            this.timeoutCopied = setTimeout(this.clearIsCopiedInClipboard, 2500)
        },
    },
}
</script>

<style lang="scss" scoped>
.input-text-to-copy {
    width: 0; // here we set the width to 0 in order to allow to shrink to the outer component
}
</style>
