<script setup lang="ts">
/**
 * Input field for local file
 *
 * The field has some default validation (accepted file types, file size and emtpiness)
 *
 * NOTE: the validation only happens when the prop activate-validation is set to true, this allow to
 * validate all fields of a form at once.
 */
import { computed, toRef, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'

import type {ValidateFunction, ValidationResult} from '@/utils/composables/useFieldValidation';

import { useComponentUniqueId } from '@/utils/composables/useComponentUniqueId'
import {
    useFieldValidation
    
    
} from '@/utils/composables/useFieldValidation'
import { humanFileSize } from '@/utils/utils'

const props = defineProps<{
    /** Label to add above the field */
    label?: string
    /** Description to add below the input */
    description?: string
    /** Mark the field as disable */
    disabled?: boolean
    /**
     * Accepted file types
     *
     * List of file extensions that are accepted. If the file doesn't match the type, it will be
     * rejected with a proper message and the field will be marked as invalid.
     */
    acceptedFileTypes?: string[]
    /** Maximum File Size allowed */
    maxFileSize?: number
    /**
     * Placeholder text
     *
     * NOTE: this should be a translation key
     */
    placeholder?: string
    /** Field is required and will be marked as invalid if empty */
    required?: boolean
    requiredInvalidMessage?: string
    /**
     * Force the field as valid
     *
     * This can be used if the field requires some external validation. When not set or set to
     * undefined this props is ignored.
     *
     * NOTE: this props is ignored when activate-validation is false
     */
    forceValid?: boolean
    /**
     * Valid message Message that will be added in green below the field once the validation has
     * been done and the field is valid.
     */
    validMessage?: string
    /**
     * Mark the field as invalid
     *
     * This can be used if the field requires some external validation. When not set or set to
     * undefined this props is ignored.
     *
     * NOTE: this props is ignored when activate-validation is false
     */
    forceInvalid?: boolean
    /**
     * Invalid message Message that will be added in red below the field once the validation has
     * been done and the field is invalid.
     *
     * NOTE: this message is overwritten if the internal validation failed (not allow file type or
     * file too big or required empty file)
     */
    invalidMessage?: string
    /**
     * Invalid message might sometimes require extra parameters to correctly set all placeholder in
     * the translated message. This object is used to convey this dynamic placeholder replacement to
     * the i18n call.
     */
    invalidMessageExtraParams?: Record<string, unknown>
    validateWhenPristine?: boolean
    /**
     * Validate function to run when the input changes The function should return an object of type
     * `{valid: Boolean, invalidMessage: String}`. The `invalidMessage` string should be a
     * translation key.
     *
     * NOTE: this function is called each time the field is modified
     */
    validate?: ValidateFunction<File>
    dataCy?: string
}>()
const {
    label = '',
    description = '',
    disabled = false,
    acceptedFileTypes = [],
    maxFileSize = 250 * 1024 * 1024, // 250 MB
    placeholder = '',
    validate,
    dataCy = '',
} = props

// the props passed down to the usFieldValidation need to be converted to refs to keep the reactivity
const required = toRef(props, 'required', false)
const requiredInvalidMessage = toRef(props, 'requiredInvalidMessage', 'no_file')
const forceValid = toRef(props, 'forceValid', false)
const forceInvalid = toRef(props, 'forceInvalid', false)
const validFieldMessage = toRef(props, 'validMessage', '')
const invalidFieldMessage = toRef(props, 'invalidMessage', '')
const validateWhenPristine = toRef(props, 'validateWhenPristine', false)

// On each component creation set the current component unique ID
const inputFileId = useComponentUniqueId('file-input')

const { t } = useI18n()
const model = defineModel<File | undefined>({ default: undefined })
const emits = defineEmits<{
    change: [void]
    fileSelected: [file?: File]
    validate: [validation: ValidationResult]
}>()

// Reactive data
const inputLocalFile = useTemplateRef<HTMLInputElement>('inputLocalFile')

// Computed properties
const maxFileSizeHuman = computed(() => humanFileSize(maxFileSize))

// Validation logic for file-specific checks
function validateFile(file?: File): ValidationResult {
    if (
        file &&
        acceptedFileTypes?.length > 0 &&
        !acceptedFileTypes.some((type: string) =>
            file.name.toLowerCase().endsWith(type.toLowerCase())
        )
    ) {
        return { valid: false, invalidMessage: 'file_unsupported_format' }
    }
    if (file && file.size > maxFileSize) {
        return { valid: false, invalidMessage: 'file_too_large' }
    }
    if (validate) {
        return validate(file)
    }
    return {
        valid: true,
        invalidMessage: '',
    }
}

const { validation } = useFieldValidation<File>({
    model,

    required,
    requiredInvalidMessage,

    validateWhenPristine,

    forceValid,
    validFieldMessage,

    forceInvalid,
    invalidFieldMessage,

    emits,
    validate: validateFile,
})

const filePathInfo = computed(() =>
    model.value ? `${model.value.name}, ${model.value.size / 1000} kb` : ''
)

// Methods
function onFileSelected(evt: Event): void {
    const target = evt.target as HTMLInputElement
    const file = target?.files?.[0] ?? undefined
    model.value = file
    emits('fileSelected', file)
}
</script>

<template>
    <div
        class="form-group has-validation"
        :data-cy="`${dataCy}`"
    >
        <label
            v-if="label"
            class="mb-2"
            :class="{ 'fw-bolder': required }"
            :for="inputFileId"
            data-cy="file-input-label"
        >
            {{ t(label) }}
        </label>
        <div
            :id="inputFileId"
            class="input-group has-validation mb-2 rounded"
        >
            <button
                class="btn btn-outline-group"
                type="button"
                :disabled="disabled"
                data-cy="file-input-browse-button"
                @click="inputLocalFile?.click()"
            >
                {{ t('browse') }}
            </button>
            <input
                ref="inputLocalFile"
                type="file"
                :disabled="disabled"
                :accept="acceptedFileTypes.join(',')"
                hidden
                data-cy="file-input"
                @change="onFileSelected"
            />
            <input
                type="text"
                class="form-control import-input rounded-end local-file-input"
                :class="{
                    'is-valid': validation && validation.valid,
                    'is-invalid': validation && !validation.valid,
                }"
                :placeholder="placeholder ? t(placeholder) : ''"
                :value="filePathInfo"
                readonly
                required
                tabindex="-1"
                data-cy="file-input-text"
                :disabled="disabled"
                @click="inputLocalFile?.click()"
            />
            <div
                v-if="validation?.invalidMessage"
                class="invalid-feedback"
                data-cy="file-input-invalid-feedback"
            >
                {{
                    t(validation.invalidMessage, {
                        maxFileSize: maxFileSizeHuman,
                        allowedFormats: acceptedFileTypes.join(', '),
                        ...invalidMessageExtraParams,
                    })
                }}
            </div>
            <div
                v-if="validMessage"
                class="valid-feedback"
                data-cy="file-input-valid-feedback"
            >
                {{ t(validMessage) }}
            </div>
        </div>
        <div
            v-if="description"
            class="form-text"
            data-cy="file-input-description"
        >
            {{ t(description) }}
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/webmapviewer-bootstrap-theme';

.local-file-input {
    cursor: pointer;
}
</style>
