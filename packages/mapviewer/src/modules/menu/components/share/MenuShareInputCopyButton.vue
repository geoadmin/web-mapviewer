<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import GeoadminTooltip from '@/utils/components/GeoadminTooltip.vue'

const { inputText, small, copyText, copiedText, labelText, hasWarning } = defineProps({
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
        default: 'copy_cta',
    },
    copiedText: {
        type: String,
        default: 'copy_done',
    },
    labelText: {
        type: String,
        default: null,
    },
    hasWarning: {
        type: Boolean,
        default: false,
    },
})

const copiedInClipboard = ref(false)
const timeoutCopied = ref(null)

const { t } = useI18n()

const tooltipContent = computed(() => {
    if (hasWarning) {
        return t('warn_share_local_file')
    }
    return null
})

const buttonText = computed(() => {
    return t(copiedInClipboard.value ? copiedText : copyText).replace('&nbsp;', '\xa0')
})

const clearIsCopiedInClipboard = () => {
    copiedInClipboard.value = false
    clearTimeout(timeoutCopied.value)
}

const copyInputToClipboard = () => {
    navigator.clipboard.writeText(inputText)
    copiedInClipboard.value = true
    timeoutCopied.value = setTimeout(clearIsCopiedInClipboard, 2500)
}

watch(() => inputText, clearIsCopiedInClipboard)

onBeforeUnmount(() => {
    clearTimeout(timeoutCopied.value)
})
</script>

<template>
    <GeoadminTooltip
        :disabled="!tooltipContent"
        theme="warning"
        :tooltip-content="tooltipContent"
    >
        <div
            v-if="inputText"
            ref="copyButton"
            data-cy="input-copy-button"
        >
            <label v-if="labelText">{{ t(labelText) }}: </label>
            <div
                class="input-group"
                :class="{ 'input-group-sm': small }"
            >
                <input
                    type="text"
                    class="form-control input-text-to-copy"
                    :class="{ 'bg-warning': hasWarning }"
                    readonly="readonly"
                    :value="inputText"
                    data-cy="menu-share-input-copy-button"
                    @focus="(event) => event.target.select()"
                />
                <button
                    class="btn"
                    :class="{
                        'btn-warning': hasWarning,
                        'btn-outline-group': !hasWarning,
                    }"
                    data-cy="menu-share-input-copy-button"
                    @click="copyInputToClipboard"
                >
                    {{ buttonText }}
                </button>
            </div>
        </div>
    </GeoadminTooltip>
</template>

<style lang="scss" scoped>
@import '@/scss/webmapviewer-bootstrap-theme';
.input-text-to-copy {
    width: 0; // here we set the width to 0 in order to allow to shrink to the outer component
}
</style>
