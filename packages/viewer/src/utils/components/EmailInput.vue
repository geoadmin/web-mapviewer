<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'

import { useComponentUniqueId } from '@/utils/composables/useComponentUniqueId'
import {
    useFieldValidation,
    type ValidateFunction,
    type ValidationResult,
} from '@/utils/composables/useFieldValidation'
import { isValidEmail } from '@/utils/utils'

const {
    label = '',
    description = '',
    disabled = false,
    placeholder = '',
    required = undefined,
    forceValid = undefined,
    validMessage,
    forceInvalid = undefined,
    invalidMessage,
    activateValidation = undefined,
    validate,
    dataCy = '',
} = defineProps<{
    /** Label to add above the field */
    label?: string
    /** Description to add below the input */
    description?: string
    /** Mark the field as disable */
    disabled?: boolean
    /**
     * Placeholder text
     *
     * NOTE: this should be a translation key
     */
    placeholder?: string
    /** Field is required and will be marked as invalid if empty */
    required?: boolean
    /**
     * Mark the field as valid
     *
     * This can be used if the field requires some external validation. When not set or set to
     * undefined this props is ignored.
     *
     * NOTE: this props is ignored when activate-validation is false
     */
    forceValid?: boolean
    /**
     * Valid message Message that will be added in green below the field once the validation has
     * been done and the field is valid.
     */
    validMessage?: string
    /**
     * Mark the field as invalid
     *
     * This can be used if the field requires some external validation. When not set or set to
     * undefined this props is ignored.
     *
     * NOTE: this props is ignored when activate-validation is false
     */
    forceInvalid?: boolean
    /**
     * Invalid message Message that will be added in red below the field once the validation has
     * been done and the field is invalid.
     *
     * NOTE: this message is overwritten if the internal validation failed (not allow file type or
     * file too big or required empty file)
     */
    invalidMessage?: string
    /**
     * Mark the field has validated.
     *
     * As long as the flag is false, no validation is run and no validation marks are set. Also the
     * props is-invalid and is-valid are ignored.
     */
    activateValidation?: boolean
    /**
     * Validate function to run when the input changes The function should return an object of type
     * `{valid: Boolean, invalidMessage: String}`. The `invalidMessage` string should be a
     * translation key.
     *
     * NOTE: this function is called each time the field is modified
     */
    validate?: ValidateFunction<string>
    dataCy?: string
}>()

const inputEmailId = useComponentUniqueId('email-input')
const model = defineModel<string>({ default: '' })

const emits = defineEmits<{
    change: [void]
    validate: [validation: ValidationResult]
    focusin: [void]
    focusout: [void]
    'keydown.enter': [void]
}>()
const { t } = useI18n()

const { validation, onFocus } = useFieldValidation<string>({
    model,

    required,
    requiredInvalidMessage: 'no_email',

    activateValidation,

    forceValid,
    validFieldMessage: validMessage,

    forceInvalid,
    invalidFieldMessage: invalidMessage ?? 'invalid_email',

    emits,
    validate: validateEmail,
})

const emailInputElement = useTemplateRef<HTMLInputElement>('emailInputElement')

function validateEmail(email?: string): ValidationResult {
    if (email && !isValidEmail(email)) {
        return { valid: false, invalidMessage: invalidMessage ?? 'invalid_email' }
    }
    if (validate) {
        return validate(email)
    }
    return { valid: true, invalidMessage: '' }
}

function focus(): void {
    emailInputElement.value?.focus()
}

defineExpose({ focus })
</script>

<template>
    <div
        class="form-group has-validation"
        :data-cy="`${dataCy}`"
    >
        <label
            v-if="label"
            class="mb-2"
            :class="{ 'fw-bolder': required }"
            :for="inputEmailId"
            data-cy="email-input-label"
        >
            {{ t(label) }}
        </label>
        <input
            :id="inputEmailId"
            ref="emailInputElement"
            v-model="model"
            :disabled="disabled"
            :class="{
                'is-invalid': validation && !validation.valid,
                'is-valid': validation && validation.valid,
            }"
            type="email"
            class="form-control"
            :required="required"
            :placeholder="placeholder ? t(placeholder) : ''"
            data-cy="email-input"
            @focusin="onFocus($event, true)"
            @focusout="onFocus($event, false)"
            @keydown.enter="emits('keydown.enter')"
        />
        <div
            v-if="validation?.invalidMessage"
            class="invalid-feedback"
            data-cy="email-input-invalid-feedback"
        >
            {{ t(validation.invalidMessage) }}
        </div>
        <div
            v-if="validMessage"
            class="valid-feedback"
            data-cy="email-input-valid-feedback"
        >
            {{ t(validMessage) }}
        </div>
        <div
            v-if="description"
            class="form-text"
            data-cy="email-input-description"
        >
            {{ t(description) }}
        </div>
    </div>
</template>
