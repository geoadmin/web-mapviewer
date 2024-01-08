<script setup>
import axios, { AxiosError } from 'axios'
import { ref, watch } from 'vue'

import ImportFileButtons from '@/modules/menu/components/advancedTools/ImportFile/ImportFileButtons.vue'
import {
    handleFileContent,
    validateName,
} from '@/modules/menu/components/advancedTools/ImportFile/utils'
import store from '@/store'
import TextInput from '@/utils/components/TextInput.vue'
import log from '@/utils/logging'
import { isValidUrl } from '@/utils/utils'

const REQUEST_TIMEOUT = 5 * 60 * 1000 // milliseconds

// Reactive data
const fileUrl = ref('')
const buttonState = ref('default')
const urlError = ref('')
const layerAdded = ref(false)
const kmlName = ref('KML')
const isFormValid = ref(false)

watch(kmlName, validateForm)
watch(fileUrl, validateForm)

// Methods
function onUrlChange() {
    buttonState.value = 'default'
}

function validateUrl(url) {
    if (!url) {
        return 'no_url'
    } else if (!isValidUrl(url)) {
        return 'invalid_url'
    }
    return ''
}

async function loadFile() {
    layerAdded.value = false
    buttonState.value = 'loading'
    let response

    try {
        response = await axios.get(fileUrl.value, { timeout: REQUEST_TIMEOUT })
        if (response.status !== 200) {
            throw new Error(`Failed to fetch ${fileUrl.value}; status_code=${response.status}`)
        }
        handleFileContent(store, response.data, fileUrl.value, kmlName.value)
        buttonState.value = 'succeeded'
        layerAdded.value = true
        setTimeout(() => (buttonState.value = 'default'), 3000)
    } catch (error) {
        buttonState.value = 'default'
        if (error instanceof AxiosError || /fetch/.test(error.message)) {
            log.error(`Failed to load file from url ${fileUrl.value}`, error)
            urlError.value = 'loading_error_network_failure'
        } else {
            log.error(`Failed to parse file from url ${fileUrl.value}`, error)
            urlError.value = 'invalid_kml_gpx_file_error'
        }
    }
}

function validateForm() {
    layerAdded.value = false
    urlError.value = ''
    if (validateUrl(fileUrl.value)) {
        isFormValid.value = false
    } else if (validateName(kmlName.value)) {
        isFormValid.value = false
    } else {
        isFormValid.value = true
    }
}
</script>

<template>
    <!-- Online Tab -->
    <div
        id="nav-online"
        class="tab-pane fade"
        role="tabpanel"
        aria-labelledby="nav-online-tab"
        data-cy="import-file-online-content"
    >
        <form class="mt-2 needs-validation">
            <TextInput
                v-model="fileUrl"
                class="mb-2"
                label="GPX / KML URL"
                :validate="validateUrl"
                :form-validation-error="urlError"
                :form-validated="layerAdded"
                data-cy="import-file-online-url-input"
                @input="onUrlChange"
            />
            <TextInput
                v-model="kmlName"
                class="mb-3"
                label="Name"
                description="Name used for the display in the maps list"
                :validate="validateName"
                :form-validated="layerAdded"
                data-cy="import-file-online-name-input"
            />
        </form>
        <ImportFileButtons
            :button-state="buttonState"
            :disabled="!isFormValid"
            @load-file="loadFile"
        />
    </div>
</template>
