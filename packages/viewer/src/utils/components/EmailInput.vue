<script setup lang="ts">
import { toRefs, useTemplateRef, withDefaults } from 'vue'
import { useI18n } from 'vue-i18n'

import { useComponentUniqueId } from '@/utils/composables/useComponentUniqueId'
import { useFieldValidation } from '@/utils/composables/useFieldValidation'
import { isValidEmail } from '@/utils/utils'

const props = withDefaults(defineProps<{
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
    validMarker?: boolean | undefined
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
    invalidMarker?: boolean | undefined
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
    validate?: ((_value?: string) => { valid: boolean; invalidMessage: string }) | undefined
    dataCy?: string
}>(), {
    validMarker: undefined,
    invalidMarker: undefined,
})

const {
    label,
    description,
    disabled,
    placeholder,
    dataCy,
} = toRefs(props)

const inputEmailId = useComponentUniqueId('email-input')

const model = defineModel<string>({ default: '' })
const emits = defineEmits(['change', 'validate', 'focusin', 'focusout', 'keydown.enter'])
const { t } = useI18n()

const {
    value,
    validMarker: computedValidMarker,
    invalidMarker: computedInvalidMarker,
    validMessage: computedValidMessage,
    invalidMessage: computedInvalidMessage,
    required: computedRequired,
    onFocus,
} = useFieldValidation(
    props,
    model,
    emits as (_event: string, ..._args: unknown[]) => void,
    {
        customValidate: validateEmail,
        requiredInvalidMessage: 'no_email',
    }
)

const emailInputElement = useTemplateRef<HTMLInputElement>('emailInputElement')

function validateEmail() {
    if (value.value && !isValidEmail(value.value)) {
        return { valid: false, invalidMessage: 'invalid_email' }
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
            :class="{ 'fw-bolder': computedRequired }"
            :for="inputEmailId"
            data-cy="email-input-label"
        >
            {{ t(label) }}
        </label>
        <input
            :id="inputEmailId"
            ref="emailInputElement"
            v-model="value"
            :disabled="disabled"
            :class="{
                'is-invalid': computedInvalidMarker,
                'is-valid': computedValidMarker,
            }"
            type="email"
            class="form-control"
            :required="computedRequired"
            :placeholder="placeholder ? t(placeholder) : ''"
            data-cy="email-input"
            @focusin="onFocus($event, true)"
            @focusout="onFocus($event, false)"
            @keydown.enter="emits('keydown.enter')"
        />
        <div
            v-if="computedInvalidMessage"
            class="invalid-feedback"
            data-cy="email-input-invalid-feedback"
        >
            {{ t(computedInvalidMessage) }}
        </div>
        <div
            v-if="computedValidMessage"
            class="valid-feedback"
            data-cy="email-input-valid-feedback"
        >
            {{ t(computedValidMessage) }}
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
