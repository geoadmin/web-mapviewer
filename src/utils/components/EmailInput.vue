<script>
// Global variable to count the components created in order to create a unique DOM id.
let components = 0
</script>
<script setup>
import { computed, ref, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'

import { useComponentUniqueId } from '@/utils/composables/useComponentUniqueId'
import { useFieldValidation } from '@/utils/composables/useFieldValidation'
import { isValidEmail } from '@/utils/utils'

const inputEmailId = useComponentUniqueId('email-input', components)

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
    dataCy: {
        type: String,
        default: '',
    },
})
const { placeholder, disabled, label, description } = toRefs(props)

const { value, validMarker, invalidMarker, validMessage, invalidMessage, required, onFocus } =
    useFieldValidation(props, model, emits, {
        customValidate: validate,
        requiredInvalidMessage: 'no_email',
    })

const emailInputElement = ref(null)

const dataCyPrefix = computed(() => (props.dataCy ? `${props.dataCy}-email-input` : `email-input`))

function validate() {
    if (value.value && !isValidEmail(value.value)) {
        return { valid: false, invalidMessage: 'invalid_email' }
    }
    return { valid: true, invalidMessage: '' }
}

function focus() {
    emailInputElement.value.focus()
}

defineExpose({ focus })
</script>

<template>
    <div class="form-group has-validation">
        <label
            v-if="label"
            class="mb-2"
            :class="{ 'fw-bolder': required }"
            :for="inputEmailId"
            :data-cy="`${dataCyPrefix}-label`"
            >{{ i18n.t(label) }}</label
        >
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
            :placeholder="placeholder ? i18n.t(placeholder) : ''"
            :data-cy="`${dataCyPrefix}`"
            @focusin="onFocus($event, true)"
            @focusout="onFocus($event, false)"
            @keydown.enter="emits('keydown.enter')"
        />
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
        <div v-if="description" class="form-text">
            {{ i18n.t(description) }}
        </div>
    </div>
</template>
