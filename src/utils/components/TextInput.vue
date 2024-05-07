<script>
// Global variable to count the components created in order to create a unique DOM id.
let components = 0
</script>
<script setup>
/** Input with clear button component */
import { nextTick, ref, toRefs, useSlots } from 'vue'
import { useI18n } from 'vue-i18n'

import { useComponentUniqueId } from '@/utils/composables/useComponentUniqueId'
import {
    propsValidator4ValidateFunc,
    useFieldValidation,
} from '@/utils/composables/useFieldValidation'

// On each component creation set the current component ID and increase the counter
const clearButtonId = useComponentUniqueId('button-addon-clear', components)
const textInputId = useComponentUniqueId('text-input', components)

const model = defineModel({ type: String })
const emits = defineEmits(['change', 'validate', 'focusin', 'focusout', 'clear', 'keydown.enter'])

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
     * NOTE: this props is ignored when activate-validation is false
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
     * Validate function to run when the input changes The function should return an object of type
     * `{valid: Boolean, invalidMessage: Sting}`. The `invalidMessage` string should be a
     * translation key.
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
const { placeholder, disabled, label, description } = toRefs(props)

const { value, validMarker, invalidMarker, validMessage, invalidMessage, onFocus, required } =
    useFieldValidation(props, model, emits)

const i18n = useI18n()
const slots = useSlots()

const inputElement = ref(null)
const error = ref('')

function onClearInput() {
    value.value = ''
    error.value = ''
    inputElement.value.focus()
    emits('clear')
}

function focus() {
    nextTick(() => inputElement.value.focus())
}

defineExpose({ focus })
</script>

<template>
    <div :data-cy="`${props.dataCy}`">
        <label
            v-if="label"
            class="mb-2"
            :class="{ 'fw-bolder': required }"
            :for="textInputId"
            data-cy="text-input-label"
            >{{ i18n.t(label) }}</label
        >
        <div class="input-group d-flex needs-validation">
            <input
                :id="textInputId"
                ref="inputElement"
                v-model="value"
                type="text"
                :disabled="disabled"
                :required="required"
                class="form-control text-truncate"
                :class="{
                    'rounded-end': !value?.length && !slots?.default,
                    'is-invalid': invalidMarker,
                    'is-valid': validMarker,
                }"
                :aria-describedby="clearButtonId"
                :placeholder="placeholder ? i18n.t(placeholder) : ''"
                :value="value"
                data-cy="text-input"
                @focusin="onFocus($event, true)"
                @focusout="onFocus($event, false)"
                @keydown.enter="emits('keydown.enter')"
            />
            <button
                v-if="value?.length > 0"
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
                v-if="invalidMessage"
                class="invalid-feedback"
                data-cy="text-input-invalid-feedback"
            >
                {{ i18n.t(invalidMessage) }}
            </div>
            <div v-if="validMessage" class="valid-feedback" data-cy="text-input-valid-feedback">
                {{ i18n.t(validMessage) }}
            </div>
        </div>
        <div v-if="description" class="form-text" data-cy="text-input-description">
            {{ i18n.t(description) }}
        </div>
    </div>
</template>
