<script setup>
import axios, { AxiosError } from 'axios'
import { onMounted, ref, toRefs, watch } from 'vue'
import { useStore } from 'vuex'

import ImportFileButtons from '@/modules/menu/components/advancedTools/ImportFile/ImportFileButtons.vue'
import { handleFileContent } from '@/modules/menu/components/advancedTools/ImportFile/utils'
import TextInput from '@/utils/components/TextInput.vue'
import { OutOfBoundsError } from '@/utils/coordinates/coordinateUtils'
import { EmptyGPXError } from '@/utils/gpxUtils'
import { EmptyKMLError } from '@/utils/kmlUtils'
import log from '@/utils/logging'
import { isValidUrl } from '@/utils/utils'

const REQUEST_TIMEOUT = 5 * 60 * 1000 // milliseconds

const store = useStore()

const props = defineProps({
    active: {
        type: Boolean,
        default: false,
    },
})
const { active } = toRefs(props)

// Reactive data
const fileUrlInput = ref(null)
const fileUrl = ref('')
const buttonState = ref('default')
const urlError = ref('')
const layerAdded = ref(false)
const isFormValid = ref(false)

watch(fileUrl, validateForm)
watch(active, (value) => {
    if (value) {
        fileUrlInput.value.focus()
    }
})

onMounted(() => {
    // Focus on the URL field when opening the import tool
    fileUrlInput.value.focus()
})

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
        handleFileContent(store, response.data, fileUrl.value)
        buttonState.value = 'succeeded'
        layerAdded.value = true
        setTimeout(() => (buttonState.value = 'default'), 3000)
    } catch (error) {
        buttonState.value = 'default'
        if (error instanceof AxiosError || /fetch/.test(error.message)) {
            log.error(`Failed to load file from url ${fileUrl.value}`, error)
            urlError.value = 'loading_error_network_failure'
        } else if (error instanceof OutOfBoundsError) {
            urlError.value = 'kml_gpx_file_out_of_bounds'
        } else if (error instanceof EmptyKMLError || error instanceof EmptyGPXError) {
            urlError.value = 'kml_gpx_file_empty'
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
        :class="{
            active: active,
            show: active,
        }"
        role="tabpanel"
        aria-labelledby="nav-online-tab"
        data-cy="import-file-online-content"
    >
        <form class="needs-validation">
            <TextInput
                ref="fileUrlInput"
                v-model="fileUrl"
                class="mb-2"
                placeholder="import_file_url_placeholder"
                :validate="validateUrl"
                :form-validation-error="urlError"
                :form-validated="layerAdded"
                data-cy="import-file-online-url-input"
                @input="onUrlChange"
                @keydown.enter="loadFile"
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
