import {
    computed,
    type ComputedRef,
    type MaybeRefOrGetter,
    onMounted,
    type Ref,
    ref,
    toValue,
    watch,
    watchEffect,
} from 'vue'

export interface ValidationResult {
    valid: boolean
    invalidMessage: string
}

export type ValidateFunction<T extends string | File> = (value?: T) => ValidationResult

export interface FieldValidationProps<T extends string | File> {
    required?: MaybeRefOrGetter<boolean>
    validMarker?: MaybeRefOrGetter<boolean>
    invalidMarker?: MaybeRefOrGetter<boolean>
    invalidMessage?: MaybeRefOrGetter<string | undefined>
    activateValidation?: MaybeRefOrGetter<boolean>
    validate?: MaybeRefOrGetter<ValidateFunction<T>>
}

export interface FieldValidationOptions {
    customValidate?: () => ValidationResult
    requiredInvalidMessage?: string
}

type FieldValidationEvents = 'change' | 'validate' | 'focusin' | 'focusout'
interface FieldValidationEventsPayloads {
    change: [value?: string | File]
    validate: [result: ValidationResult]
    focusin: [event: Event]
    focusout: [event: Event]
}
type FieldValidationEmits = <key extends FieldValidationEvents>(
    eventName: key,
    ...args: FieldValidationEventsPayloads[key]
) => void

export interface FieldValidationReturn<T extends string | File> {
    value: Ref<T | undefined>
    isValid: ComputedRef<boolean>
    validMarker: ComputedRef<boolean>
    invalidMarker: ComputedRef<boolean>
    invalidMessage: ComputedRef<string | undefined>
    onFocus: (event: Event, inFocus: boolean) => void
}

/**
 * Input field validation logic
 *
 * @param props Vue properties of the component to add the field validation
 * @param model Vue model definition of the input component (Ref or ModelRef from defineModel)
 * @param emits Vue event emitter definition of the input component
 * @param options Options object for custom validation and messages
 */
export function useFieldValidation<T extends string | File>(
    props: FieldValidationProps<T>,
    model: MaybeRefOrGetter<T | undefined>,
    emits: FieldValidationEmits,
    {
        customValidate = (): ValidationResult => {
            return { valid: true, invalidMessage: '' }
        },
        requiredInvalidMessage = 'field_required',
    }: FieldValidationOptions = {}
): FieldValidationReturn<T> {
    const { required, validMarker, invalidMarker, invalidMessage, activateValidation, validate } =
        props

    const internalModel = ref<T | undefined>(toValue(model))
    const userIsTyping = ref<boolean>(false)

    const validation = ref<ValidationResult>({ valid: true, invalidMessage: '' })

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

    // Computed properties
    const isValid = computed<boolean>(() => {
        return validation.value.valid
    })
    const internalInvalidMarker = computed<boolean>(() => {
        if (!toValue(activateValidation)) {
            return false
        }
        let _invalidMarker = !isValid.value
        if (toValue(invalidMarker) !== undefined) {
            _invalidMarker = _invalidMarker || !!toValue(invalidMarker)
        }
        return _invalidMarker
    })
    const internalValidMarker = computed<boolean>(() => {
        // Do not add a valid marker when the marker are not activated or when the field is empty
        // or when it is already marked as invalid
        if (!toValue(activateValidation) || isEmpty(internalModel.value) || !isValid.value) {
            return false
        }
        // If validMarker prop is explicitly provided (not undefined), use it
        if (toValue(validMarker) !== undefined) {
            return !!toValue(validMarker)
        }
        // Default: show valid marker when field is valid
        return true
    })
    const internalInvalidMessage = computed<string>(
        () => toValue(invalidMessage) ?? validation.value.invalidMessage ?? ''
    )

    onMounted(() => {
        internalValidate()
    })

    watchEffect(() => {
        if (toValue(model) !== internalModel.value) {
            internalModel.value = toValue(model)
        }
        internalValidate()
    })
    watch(internalModel, () => {
        emits('change', internalModel.value)
    })

    function internalValidate(): void {
        validation.value = customValidate()
        if (toValue(required) && isEmpty(internalModel.value)) {
            validation.value = {
                valid: false,
                invalidMessage: requiredInvalidMessage,
            }
        }
        if (typeof toValue(validate) === 'function' && validation.value.valid) {
            // Run user custom validation
            validation.value = toValue(validate)!(internalModel.value)
        }
        emits('validate', validation.value)
    }

    function onFocus(event: Event, inFocus: boolean): void {
        userIsTyping.value = inFocus
        if (inFocus) {
            emits('focusin', event)
        } else {
            emits('focusout', event)
        }
    }

    return {
        value: internalModel as Ref<T | undefined>,
        isValid,
        validMarker: internalValidMarker,
        invalidMarker: internalInvalidMarker,
        invalidMessage: internalInvalidMessage,
        onFocus,
    }
}
