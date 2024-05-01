<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const i18n = useI18n()

// Props
const props = defineProps({
    acceptedFileTypes: {
        type: String,
        required: true,
    },
    maxFileSize: {
        type: Number,
        default: 250 * 1024 * 1024, // 250 MB,
    },
    placeholderText: {
        type: String,
        default: '',
    },
    // Whether the component should check if the file is valid after selecting a file, otherwise the parent component handle the check
    checkOnSelect: {
        type: Boolean,
        default: true,
    },
    // Additional check done from outside the component
    additionalCheck: {
        type: Boolean,
        default: true,
    },
    // Additional error message from outside the component
    additionalErrorMessage: {
        type: String,
        default: '',
    },
})

const emits = defineEmits(['file-selected'])

// Reactive data
const InputLocalFile = ref(null)
const selectedFile = ref(null)
const errorMessage = ref(null)

// Computed properties
const isValid = computed(() => {
    if (props.checkOnSelect) {
        return !errorMessage.value && selectedFile.value
    } else {
        return (
            !errorMessage.value &&
            selectedFile.value &&
            !props.additionalErrorMessage &&
            props.additionalCheck
        )
    }
})
const isInvalid = computed(() => errorMessage.value)
const filePathInfo = computed(() =>
    selectedFile.value ? `${selectedFile.value.name}, ${selectedFile.value.size / 1000} kb` : ''
)

// Watches
watch(
    () => props.additionalErrorMessage,
    (newValue) => {
        errorMessage.value = newValue
    }
)

// Methods
function onFileSelected(evt) {
    errorMessage.value = null

    const file = evt.target?.files[0]
    if (!file) {
        selectedFile.value = null
        errorMessage.value = 'no_file'
        return
    }

    // Validate
    InputLocalFile.value = null
    selectedFile.value = file
    if (file.size > props.maxFileSize) {
        errorMessage.value = 'file_too_large'
    }
    emits('file-selected', file)
}
</script>

<template>
    <div data-cy="import-file-content-local">
        <div class="needs-validation">
            <div class="input-group rounded needs-validation mb-2">
                <button
                    class="btn btn-outline-secondary"
                    type="button"
                    @click="InputLocalFile.click()"
                >
                    {{ i18n.t('browse') }}
                </button>
                <input
                    ref="InputLocalFile"
                    type="file"
                    :accept="props.acceptedFileTypes"
                    hidden
                    data-cy="import-local-file-input"
                    @change="onFileSelected"
                />
                <input
                    type="text"
                    class="form-control import-input rounded-end import-local-file-input"
                    :class="{ 'is-valid': isValid, 'is-invalid': isInvalid }"
                    :placeholder="i18n.t(props.placeholderText)"
                    :value="filePathInfo"
                    readonly
                    required
                    tabindex="-1"
                    data-cy="import-local-file-input-text"
                    @click="InputLocalFile.click()"
                />
                <div
                    v-if="errorMessage"
                    class="invalid-feedback"
                    data-cy="import-local-file-invalid-feedback"
                >
                    {{ i18n.t(errorMessage) }}
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/webmapviewer-bootstrap-theme';

.import-local-file-input {
    cursor: pointer;
}
.import-local-file-button-connect {
    cursor: pointer;
}
</style>
