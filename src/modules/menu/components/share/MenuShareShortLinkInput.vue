<template>
    <div v-if="shortLink" class="p-1">
        <label v-if="withText">{{ $t('share_link') }}: </label>
        <div class="input-group input-group-sm">
            <input
                type="text"
                class="form-control"
                readonly="readonly"
                :value="shortLink"
                @focus="$event.target.select()"
            />
            <button class="btn btn-outline-secondary" @click="copyShortLinkInClipboard">
                {{ $t(copiedInClipboard ? 'copy_success' : 'copy_url') }}
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
