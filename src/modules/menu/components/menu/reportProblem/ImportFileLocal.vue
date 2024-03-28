<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const LOCAL_UPLOAD_ACCEPT = '.kml,.gpx,.pdf,.zip,.jpg,.jpeg,.kmz'
const LOCAL_UPLOAD_MAX_SIZE = 250 * 1024 * 1024 // 250mb

const i18n = useI18n()

const emits = defineEmits(['file-selected'])

// Reactive data
const importFileLocalInput = ref(null)
const selectedFile = ref(null)
const errorMessage = ref(null)
const isFormValid = ref(false)

// Computed properties
const isValid = computed(() => !errorMessage.value && selectedFile.value)
const isInvalid = computed(() => errorMessage.value)
const filePathInfo = computed(() =>
    selectedFile.value ? `${selectedFile.value.name}, ${selectedFile.value.size / 1000} kb` : ''
)

watch(errorMessage, validateForm)
watch(selectedFile, validateForm)

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
    importFileLocalInput.value = null
    selectedFile.value = file
    if (file.size > LOCAL_UPLOAD_MAX_SIZE) {
        errorMessage.value = 'file_too_large'
    }
    emits('file-selected', file)
}

function validateForm() {
    if (errorMessage.value) {
        isFormValid.value = false
    } else {
        isFormValid.value = true
    }
}
</script>

<template>
    <div data-cy="import-file-local-content">
        <div class="needs-validation">
            <div class="input-group rounded needs-validation mb-2">
                <button
                    class="btn btn-outline-secondary"
                    type="button"
                    @click="importFileLocalInput.click()"
                >
                    {{ i18n.t('browse') }}
                </button>
                <input
                    ref="importFileLocalInput"
                    type="file"
                    :accept="LOCAL_UPLOAD_ACCEPT"
                    hidden
                    data-cy="import-file-local-input"
                    @change="onFileSelected"
                />
                <input
                    type="text"
                    class="form-control import-input rounded-end import-file-local-input"
                    :class="{ 'is-valid': isValid, 'is-invalid': isInvalid }"
                    :placeholder="i18n.t('feedback_placeholder')"
                    :value="filePathInfo"
                    readonly
                    required
                    tabindex="-1"
                    data-cy="import-file-local-input-text"
                    @click="importFileLocalInput.click()"
                />
                <div
                    v-if="errorMessage"
                    class="invalid-feedback"
                    data-cy="import-file-local-invalid-feedback"
                >
                    {{ i18n.t(errorMessage) }}
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';

.import-file-local-input {
    cursor: pointer;
}
.import-file-local-button-connect {
    cursor: pointer;
}
</style>
