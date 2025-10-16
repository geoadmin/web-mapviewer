<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import log from '@swissgeo/log'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const {
    inputText,
    small = true,
    copyText = 'copy_cta',
    copiedText = 'copy_done',
    labelText,
    hasWarning = false,
} = defineProps<{
    inputText?: string
    small?: boolean
    copyText?: string
    copiedText?: string
    labelText?: string
    hasWarning?: boolean
}>()

const copiedInClipboard = ref(false)
const timeoutCopied = ref<ReturnType<typeof setTimeout> | undefined>()

const { t } = useI18n()

const buttonText = computed(() => {
    return t(
        copiedInClipboard.value ? (copiedText ?? 'copy_done') : (copyText ?? 'copy_cta')
    ).replace('&nbsp;', '\xa0')
})

const clearIsCopiedInClipboard = () => {
    copiedInClipboard.value = false
    if (timeoutCopied.value) {
        clearTimeout(timeoutCopied.value)
    }
}

const copyInputToClipboard = () => {
    if (inputText) {
        navigator.clipboard.writeText(inputText).catch((error) => {
            log.error({
                title: 'Failed to copy text to clipboard',
                message: [error instanceof Error ? error.message : String(error)],
            })
        })
        copiedInClipboard.value = true
        timeoutCopied.value = setTimeout(clearIsCopiedInClipboard, 2500)
    }
}

watch(() => inputText, clearIsCopiedInClipboard)

onBeforeUnmount(() => {
    if (timeoutCopied.value) {
        clearTimeout(timeoutCopied.value)
    }
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
                    readonly
                    :value="inputText"
                    data-cy="menu-share-input-copy-text"
                    @focus="(event) => (event.target as HTMLInputElement)?.select()"
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
