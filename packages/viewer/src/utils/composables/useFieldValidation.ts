import type { ComputedRef, Ref } from 'vue'

import { computed, onMounted, ref, watch } from 'vue'

export interface ValidationResult {
    valid: boolean
    invalidMessage: string
}

export type ValidateFunction<T extends string | File> = (value?: T) => ValidationResult

export interface FieldValidationProps<T extends string | File> {
    label?: string
    description?: string
    disabled?: boolean
    placeholder?: string
    required?: boolean
    validMarker?: boolean
    validMessage?: string
    invalidMarker?: boolean
    invalidMessage?: string
    activateValidation?: boolean
    validate?: ValidateFunction<T> | undefined
}

export interface FieldValidationOptions {
    customValidate?: () => ValidationResult
    requiredInvalidMessage?: string
}

export interface FieldValidationReturn<T extends string | File> {
    value: Ref<T | undefined>
    isValid: ComputedRef<boolean>
    validMarker: ComputedRef<boolean>
    invalidMarker: ComputedRef<boolean>
    validMessage: Ref<string | undefined>
    invalidMessage: ComputedRef<string | undefined>
    onFocus: (event: Event, inFocus: boolean) => void
    required: Ref<boolean | undefined>
    activateValidation: Ref<boolean | undefined>
}

export function propsValidator4ValidateFunc(value: unknown, _props: unknown): boolean {
    if (value === undefined) {
        return true
    }
    if (typeof value !== 'function') {
        return false
    }
    const returnObject = value('') as Record<string, unknown>
    if (typeof returnObject !== 'object') {
        return false
    }
    if (!('valid' in returnObject)) {
        return false
    }
    if (!('invalidMessage' in returnObject)) {
        return false
    }
    if (typeof returnObject.valid !== 'boolean') {
        return false
    }
    if (typeof returnObject.invalidMessage !== 'string') {
        return false
    }
    return true
}

/**
 * Input field validation logic
 *
 * @param props Computed ref of Vue properties containing field validation props
 * @param model Vue model definition of the input component (Ref or ModelRef from defineModel)
 * @param emits Vue event emitter definition of the input component
 * @param options Options object for custom validation and messages
 */
export function useFieldValidation<T extends string | File>(
    props: ComputedRef<FieldValidationProps<T>>,
    model: Ref<T | undefined>,
    emits: (event: string, ...args: unknown[]) => void,
    {
        customValidate = (): ValidationResult => {
            return { valid: true, invalidMessage: '' }
        },
        requiredInvalidMessage = 'field_required',
    }: FieldValidationOptions = {}
): FieldValidationReturn<T> {
    // Reactive data
    const value = ref(model.value) as Ref<T | undefined>

    const userIsTyping = ref<boolean>(false)
    const activateValidation = computed(() => props.value.activateValidation)
    const required = computed(() => props.value.required)
    const validMessage = computed(() => props.value.validMessage)
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
    const isValid = computed(() => {
        return validation.value.valid
    })
    const activateValidationMarkers = computed(() => activateValidation.value)
    const validMarker = computed(() => {
        // Do not add a valid marker when the marker are not activated or when the field is empty
        // or when it is already marked as invalid
        if (!activateValidationMarkers.value || isEmpty(value.value) || invalidMarker.value) {
            return false
        }
        let _validMarker = isValid.value
        if (props.value.validMarker !== undefined) {
            _validMarker = _validMarker && props.value.validMarker
        }
        return _validMarker
    })
    const invalidMarker = computed(() => {
        if (!activateValidationMarkers.value) {
            return false
        }
        let _invalidMarker = !isValid.value
        if (props.value.invalidMarker !== undefined) {
            _invalidMarker = _invalidMarker || props.value.invalidMarker
        }
        return _invalidMarker
    })
    const invalidMessage = computed(() => {
        if (props.value.invalidMessage) {
            return props.value.invalidMessage
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

    function validate(): void {
        validation.value = customValidate()
        if (required.value && isEmpty(value.value)) {
            validation.value = {
                valid: false,
                invalidMessage: requiredInvalidMessage,
            }
        }
        if (props.value.validate && validation.value.valid) {
            // Run user custom validation
            validation.value = props.value.validate(value.value)
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
