<script setup>
import { computed, ref, toRefs } from 'vue'

import ImportFileButtons from '@/modules/menu/components/advancedTools/ImportFile/ImportFileButtons.vue'
import EmptyFileContentError from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/EmptyFileContentError.error'
import OutOfBoundsError from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/OutOfBoundsError.error'
import UnknownProjectionError from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/UnknownProjectionError.error'
import useImportFile from '@/modules/menu/components/advancedTools/ImportFile/useImportFile.composable'
import FileInput from '@/utils/components/FileInput.vue'
import log from '@/utils/logging'

const acceptedFileTypes = ['.kml', '.kmz', '.gpx', '.tif', '.tiff']

const { handleFileSource } = useImportFile()

const props = defineProps({
    active: {
        type: Boolean,
        default: false,
    },
})
const { active } = toRefs(props)

// Reactive data
const loadingFile = ref(false)
const selectedFile = ref(null)
const errorFileLoadingMessage = ref(null)
const errorFileLoadingExtraParams = ref(null)
const isFormValid = ref(false)
const activateValidation = ref(false)
const importSuccessMessage = ref('')

const buttonState = computed(() => (loadingFile.value ? 'loading' : 'default'))

// Methods
async function loadFile() {
    importSuccessMessage.value = ''
    errorFileLoadingMessage.value = ''
    errorFileLoadingExtraParams.value = null
    activateValidation.value = true
    loadingFile.value = true

    if (isFormValid.value && selectedFile.value) {
        try {
            await handleFileSource(selectedFile.value, false)
        } catch (error) {
            if (error instanceof OutOfBoundsError) {
                errorFileLoadingMessage.value = 'imported_file_out_of_bounds'
            } else if (error instanceof EmptyFileContentError) {
                errorFileLoadingMessage.value = 'kml_gpx_file_empty'
            } else if (error instanceof UnknownProjectionError) {
                errorFileLoadingMessage.value = 'unknown_projection_error'
                errorFileLoadingExtraParams.value = { epsg: error.epsg }
            } else {
                errorFileLoadingMessage.value = 'invalid_import_file_error'
                log.error(`Failed to load file`, error)
            }
        }
    }

    loadingFile.value = false
}

function validateForm(valid) {
    isFormValid.value = valid
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
        <FileInput
            v-model="selectedFile"
            required
            :accepted-file-types="acceptedFileTypes"
            :placeholder="'no_file'"
            :activate-validation="activateValidation"
            :invalid-marker="!!errorFileLoadingMessage"
            :invalid-message="errorFileLoadingMessage"
            :invalid-message-extra-params="errorFileLoadingExtraParams"
            :valid-message="importSuccessMessage"
            @validate="validateForm"
        />
        <ImportFileButtons class="mt-2" :button-state="buttonState" @load-file="loadFile" />
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/webmapviewer-bootstrap-theme';
</style>
