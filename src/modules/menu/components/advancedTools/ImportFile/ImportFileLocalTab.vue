<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import ImportFileButtons from '@/modules/menu/components/advancedTools/ImportFile/ImportFileButtons.vue'
import {
    handleFileContent,
    validateName,
} from '@/modules/menu/components/advancedTools/ImportFile/utils'
import { useImportButton } from '@/modules/menu/components/advancedTools/useImportButton'
import TextInput from '@/utils/components/TextInput.vue'
import log from '@/utils/logging'

const LOCAL_UPLOAD_ACCEPT = '.kml,.KML,.gpx,.GPX'
const LOCAL_UPLOAD_MAX_SIZE = 250 * 1024 * 1024 // 250mb

const i18n = useI18n()
const store = useStore()

// Reactive data
const buttonState = ref('default')
const importFileLocalInput = ref(null)
const selectedFile = ref(null)
const errorMessage = ref(null)
const isFormValid = ref(false)
const layerAdded = ref(false)

const kmlName = ref('')

useImportButton(buttonState)

// Computed properties
const isValid = computed(() => !errorMessage.value && selectedFile.value && layerAdded.value)
const isInvalid = computed(() => errorMessage.value)
const filePathInfo = computed(() =>
    selectedFile.value ? `${selectedFile.value.name}, ${selectedFile.value.size / 1000} ko` : ''
)

watch(kmlName, validateForm)
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
}

async function loadFile() {
    buttonState.value = 'loading'

    if (!selectedFile.value) {
        errorMessage.value = 'no_file'
    } else {
        try {
            const content = await selectedFile.value.text()
            handleFileContent(store, content, selectedFile.value.name, kmlName.value)
            layerAdded.value = true
        } catch (error) {
            errorMessage.value = 'invalid_kml_gpx_file_error'
            log.error(`Failed to load file`, error)
        }
    }

    if (!errorMessage.value) {
        buttonState.value = 'succeeded'
        setTimeout(() => (buttonState.value = 'default'), 3000)
    } else {
        buttonState.value = 'default'
    }
}

function validateForm() {
    layerAdded.value = false
    if (errorMessage.value) {
        isFormValid.value = false
    } else if (validateName(kmlName.value)) {
        isFormValid.value = false
    } else {
        isFormValid.value = true
    }
}
</script>

<template>
    <div
        id="nav-local"
        class="tab-pane fade"
        role="tabpanel"
        aria-labelledby="nav-local-tab"
        data-cy="import-file-local-content"
    >
        <form class="mt-2 needs-validation">
            <div class="input-group rounded needs-validation mb-2">
                <button
                    class="btn btn-outline-secondary"
                    type="button"
                    @click="importFileLocalInput.click()"
                >
                    {{ i18n.t('browse') }}
                </button>
                <div
                    class="form-floating"
                    :class="{ 'is-valid': isValid, 'is-invalid': isInvalid }"
                >
                    <input
                        ref="importFileLocalInput"
                        type="file"
                        :accept="LOCAL_UPLOAD_ACCEPT"
                        hidden
                        data-cy="import-file-local-input"
                        @change="onFileSelected"
                    />
                    <input
                        id="import-file-local-input"
                        type="text"
                        class="form-control import-input rounded-end import-file-local-input"
                        :value="filePathInfo"
                        readonly
                        required
                        data-cy="import-file-local-input-text"
                        @click="importFileLocalInput.click()"
                    />
                    <label for="import-file-local-input">GPX/KML File</label>
                </div>
                <div v-if="errorMessage" class="invalid-feedback">{{ i18n.t(errorMessage) }}</div>
            </div>
            <TextInput
                v-model="kmlName"
                class="mb-3"
                label="Name"
                description="Name used for the display in the maps list"
                :validate="validateName"
                :form-validated="layerAdded"
                data-cy="import-file-local-name-input"
            />
        </form>
        <ImportFileButtons
            class="mt-2"
            :button-state="buttonState"
            :disabled="!isFormValid"
            @load-file="loadFile"
        />
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
