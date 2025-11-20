import {
    computed,
    type MaybeRefOrGetter,
    onMounted,
    type Ref,
    ref,
    toValue,
    unref,
    watch,
    watchEffect,
} from 'vue'

export type FieldValidationTypes = string | File

export interface ValidationResult {
    valid: boolean
    invalidMessage: string
}

export type ValidateFunction<T extends FieldValidationTypes> = (value?: T) => ValidationResult

type FieldValidationEvents = 'change' | 'validate' | 'focusin' | 'focusout'
interface FieldValidationEventsPayloads {
    change: [value?: FieldValidationTypes]
    validate: [result: ValidationResult]
    focusin: [event: Event]
    focusout: [event: Event]
}
type FieldValidationEmits = <key extends FieldValidationEvents>(
    eventName: key,
    ...args: FieldValidationEventsPayloads[key]
) => void

export interface FieldValidationReturn {
    /**
     * Will return the result of the validation, or undefined in case has not yet been validated (or
     * if activateValidation is false)
     */
    validation: Ref<ValidationResult | undefined>
    onFocus: (event: Event, inFocus: boolean) => void
}

interface FieldValidationConfig<T extends FieldValidationTypes> {
    model?: MaybeRefOrGetter<T | undefined>

    required?: MaybeRefOrGetter<boolean>
    requiredInvalidMessage?: MaybeRefOrGetter<string>

    /**
     * If set to false, no validation (and event emitting) will be done when the value changes. This
     * can be used to skip validation for a field that is not available to the user but must be
     * edited programmatically. It can also be used if the validation of the field requires some
     * pre-conditioning (a File must be loaded and not just selected before validating its size, for
     * example).
     */
    activateValidation?: MaybeRefOrGetter<boolean>

    /** NOTE: This prop is ignored when `activateValidation` is false. */
    forceValid?: MaybeRefOrGetter<boolean>
    validFieldMessage?: MaybeRefOrGetter<string>

    /** NOTE: This prop is ignored when `activateValidation` is false. */
    forceInvalid?: MaybeRefOrGetter<boolean>
    invalidFieldMessage?: MaybeRefOrGetter<string>

    validate?: ValidateFunction<T>
    emits?: FieldValidationEmits
}

/** Input field validation logic */
export function useFieldValidation<T extends FieldValidationTypes>(
    config: FieldValidationConfig<T>
): FieldValidationReturn {
    const {
        model,

        required,
        requiredInvalidMessage = 'field_required',

        activateValidation,

        forceValid,
        validFieldMessage,

        forceInvalid,
        invalidFieldMessage,

        validate,
        emits,
    } = config

    const userIsTyping = ref<boolean>(false)
    const validation = ref<ValidationResult | undefined>()

    const validMessage = computed<string>(() => {
        if (toValue(validFieldMessage)) {
            return toValue(validFieldMessage)!
        }
        return ''
    })
    const invalidMessage = computed<string>(() => {
        const propValue = toValue(invalidFieldMessage)
        if (propValue) {
            return propValue
        }
        return 'invalid_field'
    })

    // Helper function to check if value is empty
    const isEmpty = (value?: T): boolean => {
        if (value === null || value === undefined) {
            return true
        }
        if (typeof value === 'string') {
            return !value
        }
        return false
    }

    onMounted(() => {
        internalValidate()
    })

    watchEffect(() => {
        internalValidate()
    })
    watch(
        () => toValue(model),
        (newValue) => {
            const unrefedEmits = unref(emits)
            if (unrefedEmits) {
                unrefedEmits('change', newValue)
            }
        }
    )

    function internalValidate(): void {
        if (toValue(activateValidation) === false) {
            validation.value = undefined
            return
        }

        const unrefedEmits = unref(emits)

        if (toValue(forceValid) === true) {
            validation.value = {
                valid: true,
                invalidMessage: validMessage.value,
            }
        } else if (toValue(forceInvalid) === true) {
            validation.value = {
                valid: false,
                invalidMessage: invalidMessage.value,
            }
        } else if (toValue(required) === true && isEmpty(toValue(model))) {
            validation.value = {
                valid: false,
                invalidMessage: toValue(requiredInvalidMessage) ?? invalidMessage.value,
            }
        } else if (validate) {
            validation.value = validate(toValue(model))
        } else {
            validation.value = {
                valid: true,
                invalidMessage: validMessage.value,
            }
        }
        if (unrefedEmits) {
            unrefedEmits('validate', validation.value)
        }
    }

    function onFocus(event: Event, inFocus: boolean): void {
        userIsTyping.value = inFocus
        const unrefedEmits = unref(emits)
        if (!unrefedEmits) {
            return
        }
        if (inFocus) {
            unrefedEmits('focusin', event)
        } else {
            unrefedEmits('focusout', event)
        }
    }

    return {
        validation,
        onFocus,
    }
}
