import { computed, onMounted, ref, toRef, watch } from 'vue'

export function propsValidator4ValidateFunc(value, _props) {
    if (value === null) {
        return true
    }
    const returnObject = value('')
    if (typeof returnObject !== 'object') {
        return false
    }
    if ((!'valid') in returnObject) {
        return false
    }
    if ((!'invalidMessage') in returnObject) {
        return false
    }
    if (typeof returnObject.valid !== 'boolean') {
        return false
    }
    if (
        typeof returnObject.invalidMessage !== 'string' &&
        !(returnObject.invalidMessage instanceof 'String')
    ) {
        return false
    }
    return true
}

/**
 * Input field validation logic
 *
 * @param {object} props Vue properties of the component to add the field validation, see below for
 *   detail.
 * @param {String} props.label Label to add above the field
 * @param {String} props.description Description to add below the input
 * @param {Boolean} props.disabled Mark the field as disable
 * @param {String} props.placeholder Placeholder to put in the input field. NOTE: this should be a
 *   translation key
 * @param {Boolean} props.required Field is required and will be marked as invalid if empty
 * @param {Boolean | null} props.validMarker Mark the field as valid. This can be used if the field
 *   requires some external validation. When not set or set to null this props is ignored. NOTE:
 *   this props is ignored when activate-validation is false.
 * @param {String} props.validMessage Valid message Message that will be added in green below the
 *   field once the validation has been done and the field is valid.
 * @param {Boolean | null} props.invalidMarker Mark the field as invalid. This can be used if the
 *   field requires some external validation. When not set or set to null this props is ignored.
 *   NOTE: this props is ignored when activate-validation is false.
 * @param {String} props.invalidMessage Invalid message Message that will be added in red below the
 *   field once the validation has been done and the field is invalid. NOTE: this message is
 *   overwritten if the internal validation failed (not allow file type or file too big or required
 *   empty file).
 * @param {Boolean} props.activateValidation Mark the field has validated. As long as the flag is
 *   false, no validation is run and no validation marks are set. Also the props is-invalid and
 *   is-valid are ignored.
 * @param {Function | null} props.validate Validate function to run when the input changes The
 *   function should return an object of type `{valid: Boolean, invalidMessage: Sting}`. The
 *   `invalidMessage` string should be a translation key. See propsValidator4ValidateFunc for
 *   validation of the function. NOTE: this function is called each time the field is modified
 * @param {ModelRef} model Vue model definition of the input component
 * @param emits Vue event emitter definition of the input component
 * @param {Function} options.customValidate Custom field validation input function. This function is
 *   called for every validation
 * @param {String} options.requiredInvalidMessage Custom required invalid message to use
 */
export function useFieldValidation(
    props,
    model,
    emits,
    {
        customValidate = () => {
            return { valid: true, invalidMessage: '' }
        },
        requiredInvalidMessage = 'field_required',
    } = {}
) {
    // Reactive data
    const value = ref(model.value)

    const userIsTyping = ref(false)
    const activateValidation = toRef(props, 'activateValidation')
    const required = toRef(props, 'required')
    const validMessage = toRef(props, 'validMessage')
    const validation = ref({ valid: true, invalidMessage: '' })

    // Computed properties
    const isValid = computed(() => {
        return validation.value.valid
    })
    const activateValidationMarkers = computed(() => activateValidation.value)
    const validMarker = computed(() => {
        // Do not add a valid marker when the marker are not activated or when the field is empty
        // or when it is already marked as invalid
        if (!activateValidationMarkers.value || !value.value || invalidMarker.value) {
            return false
        }
        let _validMarker = isValid.value
        if (props.validMarker !== null) {
            _validMarker = _validMarker && props.validMarker
        }
        return _validMarker
    })
    const invalidMarker = computed(() => {
        if (!activateValidationMarkers.value) {
            return false
        }
        let _invalidMarker = !isValid.value
        if (props.invalidMarker !== null) {
            _invalidMarker = _invalidMarker || props.invalidMarker
        }
        return _invalidMarker
    })
    const invalidMessage = computed(() => {
        if (props.invalidMessage) {
            return props.invalidMessage
        }
        return validation.value.invalidMessage
    })

    // Watches
    watch(activateValidation, () => validate())
    watch(userIsTyping, () => validate())
    watch(value, () => {
        model.value = value.value
        validate()
        emits('change', value.value)
    })
    watch(model, (newValue) => (value.value = newValue))

    onMounted(() => {
        validate()
    })

    function validate() {
        validation.value = customValidate()
        if (required.value && !value.value) {
            validation.value = {
                valid: false,
                invalidMessage: requiredInvalidMessage,
            }
        }
        if (props.validate && validation.value.valid) {
            // Run user custom validation
            validation.value = props.validate(value.value)
        }
        emits('validate', validation.value.valid)
    }

    function onFocus($event, inFocus) {
        userIsTyping.value = inFocus
        if (inFocus) {
            emits('focusin', event)
        } else {
            emits('focusout', event)
        }
    }

    return {
        value,
        isValid,
        validMarker,
        invalidMarker,
        validMessage,
        invalidMessage,
        onFocus,
        required,
        activateValidation,
    }
}
