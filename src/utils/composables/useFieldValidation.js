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
            emits('focusint', event)
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
