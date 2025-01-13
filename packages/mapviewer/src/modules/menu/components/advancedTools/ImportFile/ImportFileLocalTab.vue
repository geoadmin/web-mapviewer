<script setup>
import log from '@geoadmin/log'
import { computed, ref } from 'vue'
import { useStore } from 'vuex'

import ImportFileButtons from '@/modules/menu/components/advancedTools/ImportFile/ImportFileButtons.vue'
import generateErrorMessageFromErrorType from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/generateErrorMessageFromErrorType.utils'
import useImportFile from '@/modules/menu/components/advancedTools/ImportFile/useImportFile.composable'
import FileInput from '@/utils/components/FileInput.vue'

const acceptedFileTypes = ['.kml', '.kmz', '.gpx', '.tif', '.tiff']

const { handleFileSource } = useImportFile()

const { active } = defineProps({
    active: {
        type: Boolean,
        default: false,
    },
})

// Reactive data
const loadingFile = ref(false)
const selectedFile = ref(null)
const errorFileLoadingMessage = ref(null)
const isFormValid = ref(false)
const activateValidation = ref(false)
const importSuccessMessage = ref('')
const warningSuccessMessage = ref(null)
const store = useStore()
const buttonState = computed(() => (loadingFile.value ? 'loading' : 'default'))
const layerNotFullyWithinBounds = computed(
    () => store.state.ui.lastImportedLayerIsPartiallyOutOfBounds
)
// Methods
async function loadFile() {
    importSuccessMessage.value = ''
    errorFileLoadingMessage.value = ''
    activateValidation.value = true
    loadingFile.value = true

    if (isFormValid.value && selectedFile.value) {
        try {
            await handleFileSource(selectedFile.value, false)
            importSuccessMessage.value = layerNotFullyWithinBounds.value
                ? ''
                : 'file_imported_success'
            warningSuccessMessage.value = layerNotFullyWithinBounds.value
                ? 'file_imported_partially_out_of_bounds'
                : ''
        } catch (error) {
            errorFileLoadingMessage.value = generateErrorMessageFromErrorType(error)
            log.error(`Failed to load file`, error)
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
            :invalid-message="errorFileLoadingMessage?.msg"
            :invalid-message-extra-params="errorFileLoadingMessage?.params"
            :valid-message="importSuccessMessage"
            :warning-message="warningSuccessMessage"
            @validate="validateForm"
        />
        <ImportFileButtons class="mt-2" :button-state="buttonState" @load-file="loadFile" />
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/webmapviewer-bootstrap-theme';
</style>
