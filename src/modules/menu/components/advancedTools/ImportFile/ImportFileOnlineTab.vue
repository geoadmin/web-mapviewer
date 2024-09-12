<script setup>
import { AxiosError } from 'axios'
import { computed, onMounted, ref, toRefs, watch } from 'vue'
import { useStore } from 'vuex'

import { getFileFromUrl } from '@/api/files.api'
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
const loading = ref(false)
const fileUrlInput = ref(null)
const fileUrl = ref('')
const importSuccessMessage = ref('')
const errorFileLoadingMessage = ref(null)
const isFormValid = ref(false)
const activateValidation = ref(false)

const buttonState = computed(() => (loading.value ? 'loading' : 'default'))

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

function validateUrl(url) {
    if (!url) {
        return { valid: false, invalidMessage: 'no_url' }
    } else if (!isValidUrl(url)) {
        return { valid: false, invalidMessage: 'invalid_url' }
    }
    return { valid: true, invalidMessage: '' }
}

function validateForm() {
    activateValidation.value = true
    return isFormValid.value
}

function onUrlValidate(valid) {
    isFormValid.value = valid
}

function onUrlChange() {
    errorFileLoadingMessage.value = ''
    importSuccessMessage.value = ''
}

async function loadFile() {
    importSuccessMessage.value = ''
    errorFileLoadingMessage.value = ''
    if (!validateForm()) {
        return
    }
    loading.value = true

    try {
        const response = await getFileFromUrl(fileUrl.value, {
            timeout: REQUEST_TIMEOUT,
            responseType: 'arraybuffer',
        })
        if (response.status !== 200) {
            throw new Error(`Failed to fetch ${fileUrl.value}; status_code=${response.status}`)
        }
        await handleFileContent(store, response.data, fileUrl.value)
        importSuccessMessage.value = 'file_imported_success'
        setTimeout(() => (buttonState.value = 'default'), 3000)
    } catch (error) {
        buttonState.value = 'default'
        if (error instanceof AxiosError || /fetch/.test(error.message)) {
            log.error(`Failed to load file from url ${fileUrl.value}`, error)
            errorFileLoadingMessage.value = 'loading_error_network_failure'
        } else if (error instanceof OutOfBoundsError) {
            errorFileLoadingMessage.value = 'kml_gpx_file_out_of_bounds'
        } else if (error instanceof EmptyKMLError || error instanceof EmptyGPXError) {
            errorFileLoadingMessage.value = 'kml_gpx_file_empty'
        } else {
            log.error(`Failed to parse file from url ${fileUrl.value}`, error)
            errorFileLoadingMessage.value = 'invalid_kml_gpx_file_error'
        }
    }
    loading.value = false
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
        <div>
            <TextInput
                ref="fileUrlInput"
                v-model="fileUrl"
                required
                class="mb-2"
                placeholder="import_file_url_placeholder"
                :activate-validation="activateValidation"
                :invalid-marker="!!errorFileLoadingMessage"
                :invalid-message="errorFileLoadingMessage"
                :valid-message="importSuccessMessage"
                :validate="validateUrl"
                data-cy="import-file-online-url"
                @validate="onUrlValidate"
                @change="onUrlChange"
                @keydown.enter.prevent="loadFile"
            />
        </div>
        <ImportFileButtons class="mt-2" :button-state="buttonState" @load-file="loadFile" />
    </div>
</template>
