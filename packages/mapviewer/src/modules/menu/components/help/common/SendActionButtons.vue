<script setup>
import { useI18n } from 'vue-i18n'

const emits = defineEmits(['send', 'cancel'])

const { isDisabled, isPending } = defineProps({
    isDisabled: {
        type: Boolean,
        default: false,
    },
    isPending: {
        type: Boolean,
        default: false,
    },
})

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
