<script setup lang="ts">
/**
 * Input field for local file
 *
 * The field has some default validation (accepted file types, file size and emtpiness)
 *
 * NOTE: the validation only happens when the prop activate-validation is set to true, this allow to
 * validate all fields of a form at once.
 */
import { computed, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { useComponentUniqueId } from '@/utils/composables/useComponentUniqueId'
import { propsValidator4ValidateFunc } from '@/utils/composables/useFieldValidation'
import { humanFileSize } from '@/utils/utils'

// On each component creation set the current component unique ID
const inputFileId = useComponentUniqueId('file-input')

const { t } = useI18n()
const model = defineModel<File | undefined>({ default: undefined })
const emits = defineEmits<{
    change: []
    validate: []
}>()

// Props
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
     * Accepted file types
     *
     * List of file extension that are accepted. If the file doesn't match the type it will be
     * rejected with a proper message and the field will be marked as invalid.
     *
     * @type {[String]} List Of extension string
     */
    acceptedFileTypes: {
        type: Array as () => string[],
        default: () => [],
    },
    /**
     * Maximum File Size allowed
     *
     * @type {Number}
     */
    maxFileSize: {
        type: Number,
        default: 250 * 1024 * 1024, // 250 MB,
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
     * This can be used if the field requires some external validation. When not set or set to undefined
     * this props is ignored.
     *
     * NOTE: this props is ignored when activate-validation is false
     *
     * @type {Boolean}
     */
    validMarker: {
        type: [Boolean, null],
        default: undefined,
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
     * This can be used if the field requires some external validation. When not set or set to undefined
     * this props is ignored.
     *
     * NOTE: this props is ignored when activate-validation is false
     *
     * @type {Boolean}
     */
    invalidMarker: {
        type: [Boolean, null],
        default: undefined,
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
     * Invalid message might sometimes require extra parameters to correctly set all placeholder in
     * the translated message. This object is used to convey this dynamic placeholder replacement to
     * the i18n call.
     *
     * @type {Object}
     */
    invalidMessageExtraParams: {
        type: Object,
        default: () => {},
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
     * Validate function to run when the input changes The function should return an object of type
     * `{valid: Boolean, invalidMessage: Sting}`. The `invalidMessage` string should be a
     * translation key.
     *
     * NOTE: this function is called each time the field is modified
     *
     * @type {Function | undefined}
     */
    validate: {
        type: [Function, null],
        default: undefined,
        validator: propsValidator4ValidateFunc,
    },
    dataCy: {
        type: String,
        default: '',
    },
})
const {
    acceptedFileTypes,
    placeholder,
    maxFileSize,
    disabled,
    label,
    description,
    dataCy,
    required,
    activateValidation,
    validMarker,
    invalidMarker,
    validMessage,
    invalidMessage,
} = props

// Reactive data
const inputLocalFile = useTemplateRef<HTMLInputElement>('inputLocalFile')
const internalInvalidMessage = ref<string>('')

// Computed properties
const filePathInfo = computed(() =>
    model.value ? `${model.value.name}, ${model.value.size / 1000} kb` : ''
)
const maxFileSizeHuman = computed(() => humanFileSize(maxFileSize))



// Methods
function validateFile(): { valid: boolean; invalidMessage: string } {
    const file = model.value
    if (
        file &&
        acceptedFileTypes?.length > 0 &&
        !acceptedFileTypes.some((type) =>
            file.name.toLowerCase().endsWith(type.toLowerCase())
        )
    ) {
        return { valid: false, invalidMessage: 'file_unsupported_format' }
    }
    if (file && file.size > maxFileSize) {
        return { valid: false, invalidMessage: 'file_too_large' }
    }
    if (required && !model.value) {
        return { valid: false, invalidMessage: 'no_file' }
    }
    return {
        valid: true,
        invalidMessage: '',
    }
}

function onFileSelected(evt: Event): void {
    const target = evt.target as HTMLInputElement
    const file = target?.files?.[0] ?? undefined
    model.value = file

    // Validate if custom validation is provided
    if (props.validate) {
        const result = props.validate(file)
        if (!result.valid) {
            internalInvalidMessage.value = result.invalidMessage
        } else {
            internalInvalidMessage.value = ''
        }
    } else {
        const result = validateFile()
        if (!result.valid) {
            internalInvalidMessage.value = result.invalidMessage
        } else {
            internalInvalidMessage.value = ''
        }
    }

    emits('change')
}

// Watch for validation changes
watch(
    () => [model.value, activateValidation],
    () => {
        if (activateValidation) {
            const result = props.validate ? props.validate(model.value) : validateFile()
            internalInvalidMessage.value = result.valid ? '' : result.invalidMessage
            emits('validate')
        }
    }
)
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
                :class="{ 'is-valid': validMarker, 'is-invalid': invalidMarker }"
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
                v-if="invalidMessage"
                class="invalid-feedback"
                data-cy="file-input-invalid-feedback"
            >
                {{
                    t(invalidMessage, {
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
