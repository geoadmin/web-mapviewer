<script>
// Global variable to count the components created in order to create a unique DOM id.
let components = 0
</script>
<script setup>
import { computed, ref, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'

import { useComponentUniqueId } from '@/utils/composables/useComponentUniqueId'
import {
    propsValidator4ValidateFunc,
    useFieldValidation,
} from '@/utils/composables/useFieldValidation'

const textAreaInputId = useComponentUniqueId('text-area-input', components)

const model = defineModel({ type: String })
const emits = defineEmits(['change', 'validate', 'focusin', 'focusout', 'keydown.enter'])
const i18n = useI18n()

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
const { placeholder, disabled, label, description } = toRefs(props)
const textAreaElement = ref(null)

const { value, validMarker, invalidMarker, validMessage, invalidMessage, onFocus, required } =
    useFieldValidation(props, model, emits)

const dataCyPrefix = computed(() =>
    props.dataCy ? `${props.dataCy}-text-area-input` : `text-area-input`
)

function focus() {
    textAreaElement.value.focus()
}

defineExpose({ focus })
</script>

<template>
    <div class="form-group has-validation">
        <label
            v-if="label"
            class="mb-2"
            :class="{ 'fw-bolder': required }"
            :for="textAreaInputId"
            :data-cy="`${dataCyPrefix}-label`"
            >{{ i18n.t(label) }}</label
        >
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
            :placeholder="placeholder ? i18n.t(placeholder) : ''"
            :data-cy="`${dataCyPrefix}`"
            @focusin="onFocus($event, true)"
            @focusout="onFocus($event, false)"
            @keydown.enter="emits('keydown.enter')"
        ></textarea>
        <div
            v-if="invalidMessage"
            class="invalid-feedback"
            :data-cy="`${dataCyPrefix}-invalid-feedback`"
        >
            {{ i18n.t(invalidMessage) }}
        </div>
        <div v-if="validMessage" class="valid-feedback" :data-cy="`${dataCyPrefix}-valid-feedback`">
            {{ i18n.t(validMessage) }}
        </div>
        <div v-if="description" class="form-text" :data-cy="`${dataCyPrefix}-description`">
            {{ i18n.t(description) }}
        </div>
    </div>
</template>
