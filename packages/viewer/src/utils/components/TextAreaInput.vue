<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'

import { useComponentUniqueId } from '@/utils/composables/useComponentUniqueId'
import {
    useFieldValidation,
    type ValidateFunction,
    type ValidationResult,
} from '@/utils/composables/useFieldValidation'

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
     * Placeholder
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

const textAreaInputId = useComponentUniqueId('text-area-input')
const model = defineModel<string>({ default: '' })

const emits = defineEmits<{
    change: [value?: string]
    validate: [validation: ValidationResult]
    focusin: [event: Event]
    focusout: [event: Event]
    'keydown.enter': [event: KeyboardEvent]
}>()

const { t } = useI18n()

const textAreaElement = useTemplateRef('textAreaElement')

const { validation, onFocus } = useFieldValidation<string>({
    model,

    required,

    activateValidation,

    forceValid,
    validFieldMessage: validMessage,

    forceInvalid,
    invalidFieldMessage: invalidMessage,

    validate,
    emits,
})

function focus(): void {
    textAreaElement.value?.focus()
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
            :for="textAreaInputId"
            data-cy="text-area-input-label"
        >
            {{ t(label) }}
        </label>
        <textarea
            :id="textAreaInputId"
            ref="textAreaElement"
            v-model="model"
            :disabled="disabled"
            :required="required"
            :class="{
                'is-invalid': validation && !validation.valid,
                'is-valid': validation && validation.valid,
            }"
            class="form-control"
            :placeholder="placeholder ? t(placeholder) : ''"
            data-cy="text-area-input"
            @focusin="onFocus($event, true)"
            @focusout="onFocus($event, false)"
            @keydown.enter="(e) => emits('keydown.enter', e)"
        />
        <div
            v-if="validation?.invalidMessage"
            class="invalid-feedback"
            data-cy="text-area-input-invalid-feedback"
        >
            {{ t(validation.invalidMessage) }}
        </div>
        <div
            v-if="validMessage"
            class="valid-feedback"
            data-cy="text-area-input-valid-feedback"
        >
            {{ t(validMessage) }}
        </div>
        <div
            v-if="description"
            class="form-text"
            data-cy="text-area-input-description"
        >
            {{ t(description) }}
        </div>
    </div>
</template>
