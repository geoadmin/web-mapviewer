<script setup lang="ts">
/** Input with clear button component */

import type { Ref } from 'vue'
import type { NamedValue } from 'vue-i18n'

import { computed, nextTick, ref, toRef, useSlots, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'

import { useComponentUniqueId } from '@/utils/composables/useComponentUniqueId'
import {
    useFieldValidation,
    type ValidateFunction,
    type ValidationResult,
} from '@/utils/composables/useFieldValidation'

export interface TextInputExposed {
    validation: Ref<ValidationResult | undefined>
    focus: () => void
}

const props = defineProps<{
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
     * Valid message that will be added in green below the field once the validation has been done
     * and the field is valid.
     */
    validMessage?: string
    /**
     * Force the field as valid
     *
     * This can be used if the field requires some external validation. When not set or set to
     * undefined this props is ignored.
     *
     * NOTE: this props is ignored when activate-validation is false
     */
    forceInvalid?: boolean
    /**
     * Invalid message that will be added in red below the field once the validation has been done
     * and the field is invalid.
     *
     * NOTE: this message is overwritten if the internal validation failed (not allow file type or
     * file too big or required empty file)
     */
    invalidMessage?: string
    /**
     * Parameters for replacing any placeholder within an invalid message translated text (will be
     * passed to Vue I18N when translating the invalid message).
     */
    invalidMessageParams?: NamedValue
    validateWhenPristine?: boolean
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

const {
    label = '',
    description = '',
    disabled = false,
    placeholder = '',
    invalidMessageParams,
    validate,
    dataCy = '',
} = props

// the props passed down to the usFieldValidation need to be converted to refs to keep the reactivity
const required = toRef(props, 'required', false)
const forceValid = toRef(props, 'forceValid', false)
const forceInvalid = toRef(props, 'forceInvalid', false)
const validFieldMessage = toRef(props, 'validMessage', '')
const invalidFieldMessage = toRef(props, 'invalidMessage', '')
const validateWhenPristine = toRef(props, 'validateWhenPristine', false)

// On each component creation set the current component unique ID
const clearButtonId = useComponentUniqueId('button-addon-clear')
const textInputId = useComponentUniqueId('text-input')

const model = defineModel<string>({ default: '' })
const emits = defineEmits<{
    change: [value: string]
    validate: [result: ValidationResult]
    focusin: []
    focusout: []
    clear: []
    'keydown.enter': []
}>()

const { validation, onFocus } = useFieldValidation<string>({
    model,

    required,

    validateWhenPristine,

    forceValid,
    validFieldMessage,

    forceInvalid,
    invalidFieldMessage,

    emits,
    validate,
})

const { t } = useI18n()
const slots = useSlots()

const inputElement = useTemplateRef<HTMLInputElement>('inputElement')
const error = ref<string>('')

const translatedInvalidMessage = computed<string | undefined>(() => {
    if (validation.value?.invalidMessage) {
        if (invalidMessageParams) {
            return t(validation.value.invalidMessage, invalidMessageParams)
        }
        return t(validation.value.invalidMessage)
    }
    return undefined
})

function onClearInput(event: Event): void {
    model.value = ''
    error.value = ''
    inputElement.value?.focus()
    // stopping the event here so that it won't close a modal window if used inside it.
    event.stopPropagation()
    emits('clear')
}

function focus(): void {
    void nextTick(() => inputElement.value?.focus())
}

defineExpose<TextInputExposed>({ validation, focus })
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
            :for="textInputId"
            data-cy="text-input-label"
        >
            {{ t(label) }}
        </label>
        <div class="input-group d-flex">
            <input
                :id="textInputId"
                ref="inputElement"
                v-model="model"
                type="text"
                :disabled="disabled"
                :required="required"
                class="form-control text-truncate"
                :class="{
                    'rounded-end': !model?.length && !slots?.default,
                    'is-invalid': validation && !validation.valid,
                    'is-valid': validation && validation.valid,
                }"
                :aria-describedby="clearButtonId"
                :placeholder="placeholder ? t(placeholder) : ''"
                data-cy="text-input"
                @focusin="onFocus($event, true)"
                @focusout="onFocus($event, false)"
                @keydown.enter="emits('keydown.enter')"
            />
            <button
                v-if="model.length > 0"
                :id="clearButtonId"
                class="btn btn-outline-group rounded-0"
                :class="{ 'rounded-end': !slots?.default }"
                type="button"
                data-cy="text-input-clear"
                @click="onClearInput"
            >
                <FontAwesomeIcon :icon="['fas', 'times-circle']" />
            </button>
            <slot />
            <div
                v-if="translatedInvalidMessage"
                class="invalid-feedback"
                data-cy="text-input-invalid-feedback"
            >
                {{ translatedInvalidMessage }}
            </div>
            <div
                v-if="validMessage"
                class="valid-feedback"
                data-cy="text-input-valid-feedback"
            >
                {{ t(validMessage) }}
            </div>
        </div>
        <div
            v-if="description"
            class="form-text"
            data-cy="text-input-description"
        >
            {{ t(description) }}
        </div>
    </div>
</template>
