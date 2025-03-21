<script setup>
/**
 * Input field for local file
 *
 * The field has some default validation (accepted file types, file size and emtpiness)
 *
 * NOTE: the validation only happens when the prop activate-validation is set to true, this allow to
 * validate all fields of a form at once.
 */
import { computed, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'

import { useComponentUniqueId } from '@/utils/composables/useComponentUniqueId'
import {
    propsValidator4ValidateFunc,
    useFieldValidation,
} from '@/utils/composables/useFieldValidation'
import { humanFileSize } from '@/utils/utils'

// On each component creation set the current component unique ID
const inputFileId = useComponentUniqueId('file-input')

const { t } = useI18n()
const model = defineModel({ type: [File, null] })
const emits = defineEmits(['change', 'validate'])

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
        type: Array,
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
     * @type {Function | null}
     */
    validate: {
        type: [Function, null],
        default: null,
        validator: propsValidator4ValidateFunc,
    },
    dataCy: {
        type: String,
        default: '',
    },
})
const { acceptedFileTypes, placeholder, maxFileSize, disabled, label, description, dataCy } = props

const { value, validMarker, invalidMarker, validMessage, invalidMessage, required } =
    useFieldValidation(props, model, emits, {
        customValidate: validateFile,
        requiredInvalidMessage: 'no_file',
    })

// Reactive data
const inputLocalFile = useTemplateRef('inputLocalFile')

// Computed properties

const filePathInfo = computed(() =>
    value.value ? `${value.value.name}, ${value.value.size / 1000} kb` : ''
)
const maxFileSizeHuman = computed(() => humanFileSize(maxFileSize))

// Methods
function validateFile() {
    if (
        value.value &&
        acceptedFileTypes?.length > 0 &&
        !acceptedFileTypes.some((type) =>
            value.value.name.toLowerCase().endsWith(type.toLowerCase())
        )
    ) {
        return { valid: false, invalidMessage: 'file_unsupported_format' }
    }
    if (value.value && value.value.size > maxFileSize) {
        return { valid: false, invalidMessage: 'file_too_large' }
    }
    return {
        valid: true,
        invalidMessage: '',
    }
}
function onFileSelected(evt) {
    const file = evt.target?.files[0] ?? null
    value.value = file
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
            class="input-group rounded has-validation mb-2"
        >
            <button
                class="btn btn-outline-group"
                type="button"
                :disabled="disabled"
                data-cy="file-input-browse-button"
                @click="inputLocalFile.click()"
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
                @click="inputLocalFile.click()"
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
