<script setup>
import { computed, ref, watch } from 'vue'

import { isValidEmail } from '@/utils/utils'

const emits = defineEmits(['email-updated'])
const props = defineProps({
    isRequestPending: {
        type: Boolean,
        default: false,
    },
})

// Reactive data
const email = ref('')
const userIsTypingEmail = ref(false)

// Computed properties
const isEmailValid = computed(() => {
    return !email.value || isValidEmail(email.value)
})
// Watches
watch(email, () => {
    emits('email-updated', email.value)
})
</script>

<template>
    <div>
        <span><slot name="header"></slot></span>
        <div class="input-group has-validation">
            <input
                v-model="email"
                :disabled="props.isRequestPending"
                :class="{ 'is-invalid': !userIsTypingEmail && !isEmailValid }"
                type="email"
                class="form-control"
                data-cy="feedback-email"
                @focusin="userIsTypingEmail = true"
                @focusout="userIsTypingEmail = false"
            />
            <div class="invalid-feedback">{{ $t('feedback_invalid_email') }}</div>
        </div>
    </div>
</template>
