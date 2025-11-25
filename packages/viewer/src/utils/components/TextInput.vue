<script setup lang="ts">
/** Input with clear button component */
import { nextTick, ref, useSlots, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'

import { useComponentUniqueId } from '@/utils/composables/useComponentUniqueId'
import { useFieldValidation } from '@/utils/composables/useFieldValidation'

export interface TextInputExposed {
    focus: () => void
}

export interface TextInputValidateResult {
    valid: boolean
    invalidMessage: string
}

export type TextInputValidateFunction = (_value?: string) => TextInputValidateResult

const props = withDefaults(defineProps<{
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
    invalidMessageParams?: Record<string, unknown>
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
}>(), {
    label: '',
    description: '',
    disabled: false,
    placeholder: '',
    required: false,
    validMarker: undefined,
    validMessage: '',
    invalidMarker: undefined,
    invalidMessage: '',
    invalidMessageParams: undefined,
    activateValidation: false,
    validate: undefined,
    dataCy: '',
})

const {
    label = '',
    description = '',
    disabled = false,
    placeholder = '',
    dataCy = '',
} = props

// On each component creation set the current component unique ID
const clearButtonId = useComponentUniqueId('button-addon-clear')
const textInputId = useComponentUniqueId('text-input')

const model = defineModel<string>({ default: '' })
const emits = defineEmits<{
    change: [value: string]
    validate: [result: TextInputValidateResult]
    focusin: []
    focusout: []
    clear: []
    'keydown.enter': []
}>()

const {
    value,
    validMarker: computedValidMarker,
    invalidMarker: computedInvalidMarker,
    validMessage: computedValidMessage,
    invalidMessage: computedInvalidMessage,
    onFocus,
    required: computedRequired,
} = useFieldValidation(
    props,
    model,
    emits as (_event: string, ..._args: unknown[]) => void
)

const { t } = useI18n()
const slots = useSlots()

const inputElement = useTemplateRef('inputElement')
const error = ref('')

function onClearInput(): void {
    value.value = ''
    error.value = ''
    inputElement.value?.focus()
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
            :class="{ 'fw-bolder': computedRequired }"
            :for="textInputId"
            data-cy="text-input-label"
        >
            {{ t(label) }}
        </label>
        <div class="input-group d-flex">
            <input
                :id="textInputId"
                ref="inputElement"
                v-model="value"
                type="text"
                :disabled="disabled"
                :required="computedRequired"
                class="form-control text-truncate"
                :class="{
                    'rounded-end': !value?.length && !slots?.default,
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
                v-if="value && value.length > 0"
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
                v-if="computedInvalidMessage"
                class="invalid-feedback"
                data-cy="text-input-invalid-feedback"
            >
                {{ t(computedInvalidMessage, invalidMessageParams ?? {}) }}
            </div>
            <div
                v-if="computedValidMessage"
                class="valid-feedback"
                data-cy="text-input-valid-feedback"
            >
                {{ t(computedValidMessage) }}
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
