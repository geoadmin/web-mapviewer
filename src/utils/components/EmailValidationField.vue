<script setup>
import { computed, ref, watch } from 'vue'

import { isValidEmail } from '@/utils/utils'

const emits = defineEmits(['email-updated'])
const props = defineProps({
    disabled: {
        type: Boolean,
        default: false,
    },
    label: {
        type: String,
        default: '',
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
        <div class="form-group has-validation">
            <label for="email">{{ $t(props.label) }}</label>
            <input
                id="email"
                v-model="email"
                :disabled="props.disabled"
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
