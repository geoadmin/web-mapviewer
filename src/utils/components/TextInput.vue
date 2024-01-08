<script>
// Global variable to count the components created in order to create a unique DOM id.
let components = 0
</script>
<script setup>
/** Input with clear button component */
import { computed, ref, toRefs, watch } from 'vue'
import { useI18n } from 'vue-i18n'

// On each component creation set the current component ID and increase the counter
const clearButtonId = `button-addon-clear-${components}`
components = components + 1

const model = defineModel()

const props = defineProps({
    /**
     * Placeholder to put in the input
     *
     * @type {string}
     */
    placeholder: {
        type: String,
        default: '',
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
    },
    /**
     * Form validation error message to add to the validation of the field. Should be a translation
     * key. This can be used to mark the field as invalid with an error message due to a form
     * validation failure.
     */
    formValidationError: {
        type: [String, null],
        default: null,
    },
    /**
     * If this props is non null, the field is marked valid only if this flag is true and there is
     * no error
     */
    formValidated: {
        type: [Boolean, null],
        default: null,
    },
})
const { placeholder, validate } = props
const { formValidated, formValidationError } = toRefs(props)

const i18n = useI18n()

const value = ref('')
const error = ref('')

const isValid = computed(() => {
    if (formValidated.value !== null) {
        return value.value && !error.value && !formValidationError.value && formValidated.value
    }
    return value.value && !error.value && !formValidationError.value
})
const isInvalid = computed(() => !!error.value || !!formValidationError.value)

watch(value, (newValue) => (model.value = newValue))

function onInput(event) {
    value.value = event.target.value
    if (validate) {
        error.value = validate(value.value)
    }
    emit('input', event)
}

function onFocusOut(event) {
    emit('focusout', event)
}

function onClearInput() {
    value.value = ''
    error.value = ''
    emit('clear')
}

const emit = defineEmits(['input', 'focusout', 'clear'])
</script>

<template>
    <div class="input-group d-flex needs-validation">
        <input
            type="text"
            class="form-control text-truncate"
            :class="{
                'rounded-end': !value?.length,
                'is-valid': isValid,
                'is-invalid': isInvalid,
            }"
            :aria-describedby="clearButtonId"
            :placeholder="i18n.t(placeholder)"
            :value="value"
            data-cy="text-input"
            @input="onInput"
            @focusout="onFocusOut"
        />
        <button
            v-if="value?.length > 0"
            :id="clearButtonId"
            class="btn btn-outline-group rounded-end"
            type="button"
            data-cy="text-input-clear"
            @click="onClearInput"
        >
            <FontAwesomeIcon :icon="['fas', 'times-circle']" />
        </button>
        <div v-if="error" class="invalid-feedback">{{ i18n.t(error) }}</div>
        <div v-if="formValidationError" class="invalid-feedback">
            {{ i18n.t(formValidationError) }}
        </div>
    </div>
</template>
