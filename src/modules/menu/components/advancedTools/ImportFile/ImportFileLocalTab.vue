<script setup>
import { ref, toRefs, watch } from 'vue'
import { useStore } from 'vuex'

import ImportFileButtons from '@/modules/menu/components/advancedTools/ImportFile/ImportFileButtons.vue'
import { handleFileContent } from '@/modules/menu/components/advancedTools/ImportFile/utils'
import { useImportButton } from '@/modules/menu/components/advancedTools/useImportButton'
import ImportLocalFile from '@/utils/components/ImportLocalFile.vue'
import { OutOfBoundsError } from '@/utils/coordinates/coordinateUtils'
import { EmptyGPXError } from '@/utils/gpxUtils'
import { EmptyKMLError } from '@/utils/kmlUtils'
import log from '@/utils/logging'

const acceptedFileTypes = '.kml,.KML,.gpx,.GPX'

const store = useStore()

const props = defineProps({
    active: {
        type: Boolean,
        default: false,
    },
})
const { active } = toRefs(props)

// Reactive data
const buttonState = ref('default')
const selectedFile = ref(null)
const errorFileLoadingMessage = ref(null)
const isFormValid = ref(false)
const layerAdded = ref(false)

useImportButton(buttonState)

watch(errorFileLoadingMessage, validateForm)
watch(selectedFile, resetInput)

// Methods
function handleFile(file) {
    selectedFile.value = file
}

async function loadFile() {
    buttonState.value = 'loading'

    if (!selectedFile.value) {
        errorFileLoadingMessage.value = 'no_file'
    } else {
        try {
            const content = await selectedFile.value.text()
            handleFileContent(store, content, selectedFile.value.name)
            layerAdded.value = true
        } catch (error) {
            if (error instanceof OutOfBoundsError) {
                errorFileLoadingMessage.value = 'kml_gpx_file_out_of_bounds'
            } else if (error instanceof EmptyKMLError || error instanceof EmptyGPXError) {
                errorFileLoadingMessage.value = 'kml_gpx_file_empty'
            } else {
                errorFileLoadingMessage.value = 'invalid_kml_gpx_file_error'
                log.error(`Failed to load file`, error)
            }
        }
    }

    if (!errorFileLoadingMessage.value) {
        buttonState.value = 'succeeded'
        setTimeout(() => (buttonState.value = 'default'), 3000)
    } else {
        buttonState.value = 'default'
    }
}

function validateForm() {
    if (errorFileLoadingMessage.value) {
        isFormValid.value = false
    } else {
        isFormValid.value = true
    }
}

function resetInput() {
    layerAdded.value = false
    isFormValid.value = true
}
</script>

<template>
    <div
        id="nav-local"
        class="tab-pane fade"
        :class="{
            active: active,
            show: active,
        }"
        role="tabpanel"
        aria-labelledby="nav-local-tab"
        data-cy="import-file-local-content"
    >
        <ImportLocalFile
            :accepted-file-types="acceptedFileTypes"
            :additional-error-message="errorFileLoadingMessage"
            :additional-check="layerAdded"
            :check-on-select="false"
            :placeholder-text="'no_file'"
            @file-selected="handleFile"
        ></ImportLocalFile>
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
</style>
