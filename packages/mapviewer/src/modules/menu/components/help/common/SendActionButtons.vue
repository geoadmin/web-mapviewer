<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const emits = defineEmits<{
    send: [void]
    cancel: [void]
}>()

const { isDisabled = false, isPending = false } = defineProps<{
    isDisabled?: boolean
    isPending?: boolean
}>()

const { t } = useI18n()

// Methods
function cancel() {
    emits('cancel')
}
function send() {
    emits('send')
}
</script>

<template>
    <div>
        <button
            class="btn btn-light mx-2"
            @click="cancel"
        >
            {{ t('cancel') }}
        </button>
        <button
            :disabled="isDisabled"
            class="btn btn-primary"
            data-cy="submit-button"
            @click="send"
        >
            <FontAwesomeIcon
                v-if="isPending"
                icon="spinner"
                pulse
                data-cy="submit-pending-icon"
            />
            <span
                v-else
                data-cy="submit-send-text"
            >
                {{ t('send') }}
            </span>
        </button>
    </div>
</template>
