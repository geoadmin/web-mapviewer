<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import axios, { AxiosError } from 'axios'

import { isValidUrl } from '@/utils/utils'
import log from '@/utils/logging'
import { handleFileContent } from '@/modules/menu/components/advancedTools/ImportFile/utils'
import ImportFileButtons from '@/modules/menu/components/advancedTools/ImportFile/ImportFileButtons.vue'

const BTN_RESET_TIMEOUT = 3000 // milliseconds
const REQUEST_TIMEOUT = 5 * 60 * 1000 // milliseconds

const i18n = useI18n()

// Reactive data
const fileUrl = ref('')
const buttonState = ref('default')
const errorMessage = ref(null)
const fileLoaded = ref(false)

// Computed properties
const isValid = computed(() => !errorMessage.value && fileLoaded.value)
const isInvalid = computed(() => errorMessage.value)

// Methods
function onFileUrlChange(event) {
    errorMessage.value = null
    fileUrl.value = event.target.value
}

function validateUrl() {
    errorMessage.value = null
    if (!fileUrl.value) {
        errorMessage.value = 'no_url'
    } else if (!isValidUrl(fileUrl.value)) {
        errorMessage.value = 'invalid_url'
    }
    return !errorMessage.value
}

function clearUrl() {
    fileUrl.value = ''
    errorMessage.value = null
}

async function loadFile() {
    if (!validateUrl()) {
        return
    }
    buttonState.value = 'loading'
    let response

    try {
        response = await axios.get(fileUrl.value, { timeout: REQUEST_TIMEOUT })
        if (response.status !== 200) {
            throw new Error(`Failed to fetch ${fileUrl.value}; status_code=${response.status}`)
        }
        handleFileContent(response.data, fileUrl.value)
        buttonState.value = 'succeeded'
        fileLoaded.value = true
        setTimeout(() => (buttonState.value = 'default'), BTN_RESET_TIMEOUT)
    } catch (error) {
        buttonState.value = 'default'
        if (error instanceof AxiosError || /fetch/.test(error.message)) {
            log.error(`Failed to load file from url ${fileUrl.value}`, error)
            errorMessage.value = 'loading_error_network_failure'
        } else {
            log.error(`Failed to parse file from url ${fileUrl.value}`, error)
            errorMessage.value = 'invalid_kml_gpx_file_error'
        }
    }
}
</script>

<template>
    <!-- Online Tab -->
    <div id="nav-online" class="tab-pane fade" role="tabpanel" aria-labelledby="nav-online-tab">
        <form class="input-group d-flex needs-validation">
            <input
                type="text"
                class="form-control import-input"
                :class="{
                    'rounded-end': !fileUrl?.length,
                    'is-valid': isValid,
                    'is-invalid': isInvalid,
                }"
                :placeholder="$t('import_online_placeholder')"
                :value="fileUrl"
                data-cy="import"
                @input="onFileUrlChange"
                @focusout="validateUrl()"
            />
            <button
                v-if="fileUrl?.length > 0"
                id="button-addon1"
                class="btn btn-outline-group rounded-end"
                type="button"
                data-cy="import-input-clear"
                @click="clearUrl"
            >
                <FontAwesomeIcon :icon="['fas', 'times-circle']" />
            </button>
            <div v-if="errorMessage" class="invalid-feedback">{{ i18n.t(errorMessage) }}</div>
        </form>
        <ImportFileButtons class="mt-2" :button-state="buttonState" @load-file="loadFile" />
    </div>
</template>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
</style>
