<script setup>
import { computed, ref, watch } from 'vue'

import { isValidEmail } from './utils'

const props = defineProps({
    isRequestPending: {
        type: Boolean,
        default: false,
    },
})
const emits = defineEmits(['email-updated'])

const email = ref('')
const userIsTypingEmail = ref(false)
const isEmailValid = computed(() => {
    return !email.value || isValidEmail(email.value)
})

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
