<script setup>
import { useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'

import { useComponentUniqueId } from '@/utils/composables/useComponentUniqueId'
import {
    propsValidator4ValidateFunc,
    useFieldValidation,
} from '@/utils/composables/useFieldValidation'

const textAreaInputId = useComponentUniqueId('text-area-input')

const model = defineModel({ type: String })
const emits = defineEmits(['change', 'validate', 'focusin', 'focusout', 'keydown.enter'])
const { t } = useI18n()

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
     * Placeholder
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
     * This can be used if the field requires some external validation. When not set or set to null
     * this props is ignored.
     *
     * NOTE: this props is ignored when activate-validation is false
     *
     * @type {Boolean}
     */
    validMarker: {
        type: [Boolean, null],
        default: null,
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
     * This can be used if the field requires some external validation. When not set or set to null
     * this props is ignored.
     *
     * NOTE: :data-cy="`${dataCyPrefix}-description`"this props is ignored when activate-validation
     * is false
     *
     * @type {Boolean}
     */
    invalidMarker: {
        type: [Boolean, null],
        default: null,
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
     * Validate function to run when the input changes The function should return an empty string if
     * the validation pass or an error message key that will be translated and set as invalid error
     * message.
     *
     * NOTE: this function is called each time the field is modified
     *
     * @type {Function | null}
     */
    validate: {
        type: [Function, null],
        default: null,
        validator: propsValidator4ValidateFunc,
    },
    dataCy: {
        type: String,
        default: '',
    },
})
const { placeholder, disabled, label, description, dataCy } = props
const textAreaElement = useTemplateRef('textAreaElement')

const { value, validMarker, invalidMarker, validMessage, invalidMessage, onFocus, required } =
    useFieldValidation(props, model, emits)

function focus() {
    textAreaElement.value.focus()
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
            v-model="value"
            :disabled="disabled"
            :required="required"
            :class="{
                'is-invalid': invalidMarker,
                'is-valid': validMarker,
            }"
            class="form-control"
            :placeholder="placeholder ? t(placeholder) : ''"
            data-cy="text-area-input"
            @focusin="onFocus($event, true)"
            @focusout="onFocus($event, false)"
            @keydown.enter="emits('keydown.enter')"
        />
        <div
            v-if="invalidMessage"
            class="invalid-feedback"
            data-cy="text-area-input-invalid-feedback"
        >
            {{ t(invalidMessage) }}
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
