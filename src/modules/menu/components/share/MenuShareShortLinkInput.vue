<template>
    <div v-if="shortLink">
        <label v-if="withText">{{ $t('share_link') }}: </label>
        <div class="input-group" :class="{ 'input-group-sm': small }">
            <input
                type="text"
                class="form-control input-text-to-copy"
                readonly="readonly"
                :value="shortLink"
                data-cy="menu-share-shortlink-input"
                @focus="$event.target.select()"
            />
            <button
                class="btn btn-outline-secondary"
                data-cy="menu-share-shortlink-copy-button"
                @click="copyShortLinkInClipboard"
            >
                {{ $t(copiedInClipboard ? copiedText : copyText) }}
            </button>
        </div>
    </div>
</template>

<script>
/**
 * Simple input containing the current short link of the app, with a helper button to copy the short
 * link to the clipboard
 */
export default {
    props: {
        shortLink: {
            type: String,
            default: null,
        },
        withText: {
            type: Boolean,
            default: true,
        },
        small: {
            type: Boolean,
            default: true,
        },
        copyText: {
            type: String,
            default: 'copy_url',
        },
        copiedText: {
            type: String,
            default: 'copy_success',
        },
    },
    data() {
        return {
            copiedInClipboard: false,
            timeoutCopied: null,
        }
    },
    watch: {
        shortLink() {
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
        copyShortLinkInClipboard() {
            navigator.clipboard.writeText(this.shortLink)
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
