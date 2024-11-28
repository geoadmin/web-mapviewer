<template>
    <div
        v-if="inputText"
        id="input-copy-button"
        :data-tippy-content="hasWarning ? 'warn_share_local_file' : ''"
    >
        <label v-if="labelText">{{ $t(labelText) }}: </label>
        <div class="input-group" :class="{ 'input-group-sm': small }">
            <input
                type="text"
                class="form-control input-text-to-copy"
                :class="{ 'border-warning text-warning': hasWarning }"
                readonly="readonly"
                :value="inputText"
                data-cy="menu-share-input-copy-button"
                @focus="$event.target.select()"
            />
            <button
                class="btn"
                :class="{ 'btn-outline-warning': hasWarning, 'btn-outline-group': !hasWarning }"
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

import { useTippyTooltip } from '@/utils/composables/useTippyTooltip'

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
        hasWarning: {
            type: Boolean,
            default: false,
        },
    },
    setup() {
        const i18n = useI18n()

        const { refreshTippyAttachment, removeTippy } = useTippyTooltip(
            '#input-copy-button[data-tippy-content]',
            {
                placement: 'right',
            }
        )

        return {
            i18n,
            refreshTippyAttachment,
            removeTippy,
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
    mounted() {
        this.refreshTippyAttachment()
        if (!this.hasWarning) {
            this.removeTippy()
        }
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
