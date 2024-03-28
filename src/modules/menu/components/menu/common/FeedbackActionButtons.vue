<script setup>
const emits = defineEmits(['send', 'cancel'])

const props = defineProps({
    isDisabled: {
        type: Boolean,
        default: false,
    },
    isPending: {
        type: Boolean,
        default: false,
    },
})

function cancel() {
    emits('cancel')
}
function send() {
    emits('send')
}
</script>

<template>
    <div>
        <button class="btn btn-light mx-2" @click="cancel">
            {{ $t('cancel') }}
        </button>
        <button
            :disabled="props.isDisabled"
            class="btn btn-primary"
            data-cy="submit-feedback-button"
            @click="send"
        >
            <FontAwesomeIcon
                v-if="props.isPending"
                icon="spinner"
                pulse
                data-cy="feedback-pending-icon"
            />
            <span v-else data-cy="feedback-send-text">{{ $t('send') }}</span>
        </button>
    </div>
</template>
