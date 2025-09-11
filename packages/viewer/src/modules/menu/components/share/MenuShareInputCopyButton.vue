<script setup lang="js">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

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
    <div>
        <div
            v-if="inputText"
            ref="copyButton"
        >
            <label v-if="labelText">{{ t(labelText) }}: </label>
            <div
                class="input-group"
                :class="{ 'input-group-sm': small }"
            >
                <input
                    type="text"
                    class="form-control"
                    :class="{ 'border-warning': hasWarning }"
                    readonly="readonly"
                    :value="inputText"
                    data-cy="menu-share-input-copy-text"
                    @focus="(event) => event.target.select()"
                />
                <button
                    class="btn rounded-start-0"
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
        <div
            v-if="hasWarning"
            class="d-flex align-items-center mt-1 gap-1"
            data-cy="share-warning-local-files"
        >
            <span class="text-warning">
                <FontAwesomeIcon icon="circle-exclamation" />
            </span>
            {{ t('warn_share_local_file') }}
        </div>
    </div>
</template>
