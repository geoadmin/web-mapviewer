<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import log from '@/utils/logging'
import { handleFileContent } from '@/modules/menu/components/advancedTools/ImportFile/utils'
import ImportFileButtons from '@/modules/menu/components/advancedTools/ImportFile/ImportFileButtons.vue'

const BTN_RESET_TIMEOUT = 3000 // milliseconds

const LOCAL_UPLOAD_ACCEPT = '.kml,.KML,.gpx,.GPX'
const LOCAL_UPLOAD_MAX_SIZE = 250 * 1024 * 1024 // 250mb

const i18n = useI18n()

// Reactive data
const buttonState = ref('default')
const importFileLocalInput = ref(null)
const selectedFile = ref(null)
const errorMessage = ref(null)

// Computed properties
const isValid = computed(() => !errorMessage.value && selectedFile.value)
const isInvalid = computed(() => errorMessage.value)
const filePathInfo = computed(() =>
    selectedFile.value ? `${selectedFile.value.name}, ${selectedFile.value.size / 1000} ko` : ''
)

// Methods
function onFileSelected(evt) {
    errorMessage.value = null

    const file = evt.target?.files[0]
    if (!file) {
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
            handleFileContent(content, selectedFile.value.name)
        } catch (error) {
            errorMessage.value = 'invalid_kml_gpx_file_error'
            log.error(`Failed to load file`, error)
        }
    }

    if (!errorMessage.value) {
        buttonState.value = 'succeeded'
        setTimeout(() => (buttonState.value = 'default'), BTN_RESET_TIMEOUT)
    } else {
        buttonState.value = 'default'
    }
}
</script>

<template>
    <div id="nav-local" class="tab-pane fade" role="tabpanel" aria-labelledby="nav-local-tab">
        <form class="input-group rounded needs-validation">
            <button
                class="btn btn-outline-secondary"
                type="button"
                @click="() => $refs.importFileLocalInput.click()"
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
                :placeholder="i18n.t('no_file')"
                :value="filePathInfo"
                readonly
                required
                @click="importFileLocalInput.click()"
            />
            <div v-if="errorMessage" class="invalid-feedback">{{ i18n.t(errorMessage) }}</div>
        </form>
        <ImportFileButtons
            class="mt-2"
            :button-state="buttonState"
            :disabled="!!errorMessage"
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
