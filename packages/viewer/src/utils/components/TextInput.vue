<script setup lang="ts">
/** Input with clear button component */

import type { NamedValue } from 'vue-i18n'

import { computed, nextTick, ref, toRef, useSlots, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'

import { useComponentUniqueId } from '@/utils/composables/useComponentUniqueId'
import {
    type FieldValidationProps,
    useFieldValidation,
} from '@/utils/composables/useFieldValidation'

export interface TextInputExposed {
    focus: () => void
}

export interface TextInputValidateResult {
    valid: boolean
    invalidMessage: string
}

export type TextInputValidateFunction = (_value?: string) => TextInputValidateResult

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
    validMarker?: boolean
    /**
     * Valid message that will be added in green below the field once the validation has been done
     * and the field is valid.
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
    invalidMarker?: boolean
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
    validate?: TextInputValidateFunction
    dataCy?: string
}>()

const {
    label = '',
    description = '',
    disabled = false,
    placeholder = '',
    validMessage = '',
    invalidMessageParams = undefined,
    dataCy = '',
} = props

// to keep the reactivity going (with the useFieldValidation composable, and the parent that used this component)
// we wrap some props to refs (those that are passed as FieldValidationProps)
const required = toRef(props, 'required', false)
const validMarker = toRef(props, 'validMarker')
const invalidMarker = toRef(props, 'invalidMarker')
const invalidMessage = toRef(props, 'invalidMessage')
const activateValidation = toRef(props, 'activateValidation', false)
const validate = toRef(props, 'validate', undefined)

// On each component creation set the current component unique ID
const clearButtonId = useComponentUniqueId('button-addon-clear')
const textInputId = useComponentUniqueId('text-input')

const inputValue = defineModel<string>({ default: '' })
const emits = defineEmits<{
    change: [value: string]
    validate: [result: TextInputValidateResult]
    focusin: []
    focusout: []
    clear: []
    'keydown.enter': []
}>()

const validationProps: FieldValidationProps<string> = {
    required,
    validMarker,
    invalidMarker,
    invalidMessage,
    activateValidation,
    validate,
}

const {
    validMarker: computedValidMarker,
    invalidMarker: computedInvalidMarker,
    invalidMessage: computedInvalidMessage,
    onFocus,
} = useFieldValidation(validationProps, inputValue, emits)

const { t } = useI18n()
const slots = useSlots()

const inputElement = useTemplateRef<HTMLInputElement>('inputElement')
const error = ref<string>('')

const translatedInvalidMessage = computed<string | undefined>(() => {
    if (computedInvalidMessage.value) {
        if (invalidMessageParams) {
            return t(computedInvalidMessage.value, invalidMessageParams)
        }
        return t(computedInvalidMessage.value)
    }
    return undefined
})

function onClearInput(event: Event): void {
    inputValue.value = ''
    error.value = ''
    inputElement.value?.focus()
    // stopping the event here so that it won't close a modal window if used inside it.
    event.stopPropagation()
    emits('clear')
}

function focus(): void {
    void nextTick(() => inputElement.value?.focus())
}

defineExpose<TextInputExposed>({ focus })
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
                v-model="inputValue"
                type="text"
                :disabled="disabled"
                :required="required"
                class="form-control text-truncate"
                :class="{
                    'rounded-end': !inputValue?.length && !slots?.default,
                    'is-invalid': computedInvalidMarker,
                    'is-valid': computedValidMarker,
                }"
                :aria-describedby="clearButtonId"
                :placeholder="placeholder ? t(placeholder) : ''"
                data-cy="text-input"
                @focusin="onFocus($event, true)"
                @focusout="onFocus($event, false)"
                @keydown.enter="emits('keydown.enter')"
            />
            <button
                v-if="inputValue && inputValue.length > 0"
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
