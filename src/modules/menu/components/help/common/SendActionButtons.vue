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
        <button class="btn btn-light mx-2" @click="cancel">
            {{ $t('cancel') }}
        </button>
        <button
            :disabled="props.isDisabled"
            class="btn btn-primary"
            data-cy="submit-button"
            @click="send"
        >
            <FontAwesomeIcon
                v-if="props.isPending"
                icon="spinner"
                pulse
                data-cy="submit-pending-icon"
            />
            <span v-else data-cy="submit-send-text">{{ $t('send') }}</span>
        </button>
    </div>
</template>
