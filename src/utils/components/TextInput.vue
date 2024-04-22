<script>
// Global variable to count the components created in order to create a unique DOM id.
let components = 0
</script>
<script setup>
/** Input with clear button component */
import { computed, nextTick, ref, toRefs, useSlots, watch } from 'vue'
import { useI18n } from 'vue-i18n'

// On each component creation set the current component ID and increase the counter
const clearButtonId = `button-addon-clear-${components}`
components = components + 1

const model = defineModel({ type: String })

const props = defineProps({
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
const { formValidated, formValidationError, description } = toRefs(props)

const i18n = useI18n()
const slots = useSlots()

const inputElement = ref(null)
const value = ref(model.value)
const error = ref('')

const showDescription = computed(() => description.value?.length > 0)
const isValid = computed(() => {
    if (formValidated.value !== null) {
        return value.value && !error.value && !formValidationError.value && formValidated.value
    }
    return value.value && !error.value && !formValidationError.value
})
const isInvalid = computed(() => !!error.value || !!formValidationError.value)

watch(value, (newValue) => (model.value = newValue))
watch(model, (newValue) => (value.value = newValue))

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
    inputElement.value.focus()
    emit('clear')
}

function focus() {
    nextTick(() => inputElement.value.focus())
}

const emit = defineEmits(['input', 'focusout', 'clear', 'keydown.enter'])

defineExpose({ focus })
</script>

<template>
    <div>
        <div class="input-group d-flex needs-validation">
            <input
                ref="inputElement"
                type="text"
                class="form-control text-truncate"
                :class="{
                    'rounded-end': !value?.length && !slots.default,
                    'is-valid': isValid,
                    'is-invalid': isInvalid,
                }"
                :aria-describedby="clearButtonId"
                :placeholder="i18n.t(placeholder)"
                :value="value"
                data-cy="text-input"
                @input="onInput"
                @focusout="onFocusOut"
                @keydown.enter="emit('keydown.enter')"
            />
            <button
                v-if="value?.length > 0"
                :id="clearButtonId"
                class="btn btn-outline-group rounded-0"
                :class="{ 'rounded-end': !slots.default }"
                type="button"
                data-cy="text-input-clear"
                @click="onClearInput"
            >
                <FontAwesomeIcon :icon="['fas', 'times-circle']" />
            </button>
            <slot />
            <div v-if="error" class="invalid-feedback" data-cy="invalid-feedback-error">
                {{ i18n.t(error) }}
            </div>
            <div
                v-if="formValidationError"
                class="invalid-feedback"
                data-cy="invalid-feedback-validation-error"
            >
                {{ i18n.t(formValidationError) }}
            </div>
        </div>
        <div v-if="showDescription" class="form-text">
            {{ i18n.t(description) }}
        </div>
    </div>
</template>
