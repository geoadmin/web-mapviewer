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
    methods: {
        clearIsCopiedInClipboard() {
            this.copiedInClipboard = false
            if (this.timeoutCopied) {
                clearTimeout(this.timeoutCopied)
                this.timeoutCopied = null
            }
        },
        copyShortLinkInClipboard() {
            navigator.clipboard.writeText(this.shortLink)
            this.copiedInClipboard = true
            this.timeoutCopied = setTimeout(this.clearIsCopiedInClipboard, 2500)
        },
    },
}
</script>
