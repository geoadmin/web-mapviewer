<script setup>
import { computed, ref, toRefs } from 'vue'
import { useStore } from 'vuex'

import ImportFileButtons from '@/modules/menu/components/advancedTools/ImportFile/ImportFileButtons.vue'
import { handleFileContent } from '@/modules/menu/components/advancedTools/ImportFile/utils'
import FileInput from '@/utils/components/FileInput.vue'
import { OutOfBoundsError } from '@/utils/coordinates/coordinateUtils'
import { EmptyGPXError } from '@/utils/gpxUtils'
import { EmptyKMLError } from '@/utils/kmlUtils'
import log from '@/utils/logging'

const acceptedFileTypes = ['.kml', '.KML', '.kmz', '.KMZ', '.gpx', '.GPX']

const store = useStore()

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
const isFormValid = ref(false)
const activateValidation = ref(false)
const importSuccessMessage = ref('')

const buttonState = computed(() => (loadingFile.value ? 'loading' : 'default'))

// Methods
async function loadFile() {
    importSuccessMessage.value = ''
    errorFileLoadingMessage.value = ''
    activateValidation.value = true
    loadingFile.value = true

    if (isFormValid.value && selectedFile.value) {
        try {
            // The file might be a KMZ which is a zip archive. Handling zip archive as text is
            // asking for trouble, therefore we need first to get it as binary
            const content = await selectedFile.value.arrayBuffer()
            await handleFileContent(store, content, selectedFile.value.name)
            importSuccessMessage.value = 'file_imported_success'
        } catch (error) {
            if (error instanceof OutOfBoundsError) {
                errorFileLoadingMessage.value = 'kml_gpx_file_out_of_bounds'
            } else if (error instanceof EmptyKMLError || error instanceof EmptyGPXError) {
                errorFileLoadingMessage.value = 'kml_gpx_file_empty'
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
            :valid-message="importSuccessMessage"
            @validate="validateForm"
        />
        <ImportFileButtons class="mt-2" :button-state="buttonState" @load-file="loadFile" />
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/webmapviewer-bootstrap-theme';
</style>
