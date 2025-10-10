<script setup lang="ts">
import { useTemplateRef, type PropType, computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { useComponentUniqueId } from '@/utils/composables/useComponentUniqueId'
import {
    propsValidator4ValidateFunc,
    useFieldValidation
} from '@/utils/composables/useFieldValidation'
import { isValidEmail } from '@/utils/utils'

const inputEmailId = useComponentUniqueId('email-input')

const model = defineModel<string>({ default: '' })
const emits = defineEmits(['change', 'validate', 'focusin', 'focusout', 'keydown.enter'])
const { t } = useI18n()

// Create a computed ref wrapper for the model to match the expected type
const modelRef = computed({
    get: () => model.value,
    set: (value: string) => { model.value = value }
})

const props = defineProps({
    /**
     * Label to add above the field
     *
     * @type {String}
     */
    label: {
        type: String,
        default: '',
    },
    /**
     * Description to add below the input
     *
     * @type {String}
     */
    description: {
        type: String,
        default: '',
    },
    /**
     * Mark the field as disable
     *
     * @type {Boolean}
     */
    disabled: {
        type: Boolean,
        default: false,
    },
    /**
     * Placeholder text
     *
     * NOTE: this should be a translation key
     *
     * @type {string}
     */
    placeholder: {
        type: String,
        default: '',
    },
    /**
     * Field is required and will be marked as invalid if empty
     *
     * @type {Boolean}
     */
    required: {
        type: Boolean,
        default: false,
    },
    /**
     * Mark the field as valid
     *
     * This can be used if the field requires some external validation. When not set or set to undefined
     * this props is ignored.
     *
     * NOTE: this props is ignored when activate-validation is false
     *
     * @type {Boolean}
     */
    validMarker: {
        type: [Boolean, null],
        default: undefined,
    },
    /**
     * Valid message Message that will be added in green below the field once the validation has
     * been done and the field is valid.
     *
     * @type {Sting}
     */
    validMessage: {
        type: String,
        default: '',
    },
    /**
     * Mark the field as invalid
     *
     * This can be used if the field requires some external validation. When not set or set to undefined
     * this props is ignored.
     *
     * NOTE: this props is ignored when activate-validation is false
     *
     * @type {Boolean}
     */
    invalidMarker: {
        type: [Boolean, null],
        default: undefined,
    },
    /**
     * Invalid message Message that will be added in red below the field once the validation has
     * been done and the field is invalid.
     *
     * NOTE: this message is overwritten if the internal validation failed (not allow file type or
     * file too big or required empty file)
     *
     * @type {Sting}
     */
    invalidMessage: {
        type: String,
        default: '',
    },
    /**
     * Mark the field has validated.
     *
     * As long as the flag is false, no validation is run and no validation marks are set. Also the
     * props is-invalid and is-valid are ignored.
     */
    activateValidation: {
        type: Boolean,
        default: false,
    },
    /**
     * Validate function to run when the input changes The function should return an object of type
     * `{valid: Boolean, invalidMessage: String}`. The `invalidMessage` string should be a
     * translation key.
     *
     * NOTE: this function is called each time the field is modified
     *
     * @type {ValidateFunction | undefined}
     */
    validate: {
        type: Function as PropType<((_value?: string) => { valid: boolean; invalidMessage: string }) | undefined>,
        default: undefined,
        validator: propsValidator4ValidateFunc,
    },
    dataCy: {
        type: String,
        default: '',
    },
})
const { placeholder, disabled, label, description, dataCy } = props

const { value, validMarker, invalidMarker, validMessage, invalidMessage, required, onFocus } =
    useFieldValidation(props, modelRef, emits as (_event: string, ..._args: unknown[]) => void, {
        customValidate: validateEmail,
        requiredInvalidMessage: 'no_email',
    })

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
            :class="{ 'fw-bolder': required }"
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
                'is-invalid': invalidMarker,
                'is-valid': validMarker,
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
            v-if="invalidMessage"
            class="invalid-feedback"
            data-cy="email-input-invalid-feedback"
        >
            {{ t(invalidMessage) }}
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
